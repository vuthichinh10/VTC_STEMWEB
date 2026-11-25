# ADR 0004: BLE is a GATT gateway

Status: accepted for M6. Web/native adapters exchange `DeviceCommand` and `DeviceEvent` over GATT and forward authenticated audit/telemetry to the API. BLE is not MQTT and receives no broker credential.
