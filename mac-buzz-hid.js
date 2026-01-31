'use strict';

const HID = require('node-hid');

// Buzz controller hardware IDs
const BUZZ_VENDOR_ID = 1356; // Sony
const BUZZ_PRODUCT_ID = 4096;

// Button mappings from node-buzzers (byte index, bit index)
const BUTTON_MAPPINGS = [
  // Controller 1
  { bytes: [2, 7], button: 0, controller: 1 }, // buzz
  { bytes: [2, 3], button: 1, controller: 1 }, // blue
  { bytes: [2, 4], button: 2, controller: 1 }, // orange
  { bytes: [2, 5], button: 3, controller: 1 }, // green
  { bytes: [2, 6], button: 4, controller: 1 }, // yellow
  // Controller 2
  { bytes: [2, 2], button: 0, controller: 2 },
  { bytes: [3, 6], button: 1, controller: 2 },
  { bytes: [3, 7], button: 2, controller: 2 },
  { bytes: [2, 0], button: 3, controller: 2 },
  { bytes: [2, 1], button: 4, controller: 2 },
  // Controller 3
  { bytes: [3, 5], button: 0, controller: 3 },
  { bytes: [3, 1], button: 1, controller: 3 },
  { bytes: [3, 2], button: 2, controller: 3 },
  { bytes: [3, 3], button: 3, controller: 3 },
  { bytes: [3, 4], button: 4, controller: 3 },
  // Controller 4
  { bytes: [3, 0], button: 0, controller: 4 },
  { bytes: [4, 4], button: 1, controller: 4 },
  { bytes: [4, 5], button: 2, controller: 4 },
  { bytes: [4, 6], button: 3, controller: 4 },
  { bytes: [4, 7], button: 4, controller: 4 },
];

const BUTTON_NAME_MAP = ['buzz', 'blue', 'orange', 'green', 'yellow'];

/**
 * Parse HID data buffer to button states
 */
function parseButtonData(data) {
  const bytes = Array.from(data).map((byte) => {
    const bits = [];
    for (let i = 7; i >= 0; i--) {
      bits.push(Boolean(byte & (1 << i)));
    }
    return bits;
  });

  return BUTTON_MAPPINGS.map((mapping) => {
    const [byteIdx, bitIdx] = mapping.bytes;
    return bytes[byteIdx] ? bytes[byteIdx][bitIdx] : false;
  });
}

/**
 * macOS Buzz controller HID wrapper
 * Provides direct HID access with 8-byte aligned writes for LED control
 */
class MacBuzzHID {
  constructor() {
    this.device = null;
    this.previousButtonStates = new Array(20).fill(false);
    this.pressListeners = new Set();
    this.releaseListeners = new Set();
    this.errorListeners = new Set();
  }

  /**
   * Initialize the HID device
   * @returns {boolean} true if successful
   */
  init() {
    try {
      const devices = HID.devices();
      const buzzDevice =
        devices.find((d) => d.vendorId === BUZZ_VENDOR_ID && d.productId === BUZZ_PRODUCT_ID) ||
        devices.find((d) => d.product && d.product.match(/Buzz/));

      if (!buzzDevice || !buzzDevice.path) {
        throw new Error('Buzz device not found');
      }

      console.log('macOS: Found Buzz device:', buzzDevice.product);
      this.device = new HID.HID(buzzDevice.path);

      // Handle button data
      this.device.on('data', (data) => {
        const buttonStates = parseButtonData(data);

        buttonStates.forEach((state, index) => {
          if (state !== this.previousButtonStates[index]) {
            const mapping = BUTTON_MAPPINGS[index];
            const ev = {
              controller: mapping.controller,
              button: mapping.button,
            };

            if (state) {
              this.pressListeners.forEach((cb) => cb(ev));
            } else {
              this.releaseListeners.forEach((cb) => cb(ev));
            }
          }
        });

        this.previousButtonStates = buttonStates;
      });

      this.device.on('error', (err) => {
        this.errorListeners.forEach((cb) => cb(err));
      });

      console.log('macOS: Direct HID control initialized successfully');
      return true;
    } catch (err) {
      console.error('macOS: Failed to init direct HID:', err.message);
      return false;
    }
  }

  /**
   * Set LED states for all 4 controllers
   * Uses 8-byte aligned write required by macOS
   */
  setLeds(led1, led2, led3, led4) {
    if (!this.device) return;

    const ledBytes = [
      led1 ? 0xff : 0x00,
      led2 ? 0xff : 0x00,
      led3 ? 0xff : 0x00,
      led4 ? 0xff : 0x00,
    ];

    try {
      // macOS requires 8-byte aligned write for Buzz controllers
      // Format: [ReportID, padding, LED1, LED2, LED3, LED4, padding, padding]
      this.device.write([0x00, 0x00, ...ledBytes, 0x00, 0x00]);
    } catch (err) {
      console.error('macOS LED write failed:', err.message);
    }
  }

  onPress(callback) {
    this.pressListeners.add(callback);
  }

  onRelease(callback) {
    this.releaseListeners.add(callback);
  }

  onError(callback) {
    this.errorListeners.add(callback);
  }

  close() {
    if (this.device) {
      try {
        this.device.close();
      } catch (err) {
        // Ignore close errors
      }
      this.device = null;
    }
  }
}

module.exports = MacBuzzHID;
