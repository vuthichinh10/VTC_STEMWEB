# Arduino simulation support

Current status: **Not implemented (M3)**. Code shown in M1 is reference content and cannot be run. The UI says so and exposes no success state.

Target subset: `setup`, `loop`, integer/boolean expressions, `pinMode`, `digitalRead`, `digitalWrite`, `analogRead`, ESP32 LEDC PWM subset, `delay`, serial output, constrained `Wire`/BH1750 behavior and virtual time. Unsupported libraries, networking, BLE, RTOS and arbitrary ESP32 framework features must produce diagnostics rather than guessed behavior.
