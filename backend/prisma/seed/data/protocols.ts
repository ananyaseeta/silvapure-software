/**
 * Protocol Adapter Seed Data
 *
 * Matches ProtocolAdapter model:
 *   { code: String @unique, name: String, protocol: CommunicationProtocol,
 *     version: String?, endpoint: String?, port: Int?,
 *     configuration: Json?, isEnabled: Boolean }
 */

import { CommunicationProtocol } from '@prisma/client';

export interface ProtocolAdapterSeedData {
  code:          string;
  name:          string;
  protocol:      CommunicationProtocol;
  version:       string | null;
  endpoint:      string | null;
  port:          number | null;
  configuration: Record<string, unknown> | null;
  isEnabled:     boolean;
}

export const protocolAdapters: ProtocolAdapterSeedData[] = [
  {
    code:          'MQTT_DEFAULT',
    name:          'MQTT Default Broker',
    protocol:      CommunicationProtocol.MQTT,
    version:       '5.0',
    endpoint:      'mqtt://localhost',
    port:          1883,
    configuration: { qos: 1, keepAlive: 60, cleanSession: true },
    isEnabled:     true,
  },
  {
    code:          'MQTT_TLS',
    name:          'MQTT Secure (TLS)',
    protocol:      CommunicationProtocol.MQTT,
    version:       '5.0',
    endpoint:      'mqtts://localhost',
    port:          8883,
    configuration: { qos: 1, keepAlive: 60, cleanSession: true, tls: true },
    isEnabled:     true,
  },
  {
    code:          'OPCUA_DEFAULT',
    name:          'OPC-UA Default Server',
    protocol:      CommunicationProtocol.OPC_UA,
    version:       '1.04',
    endpoint:      'opc.tcp://localhost',
    port:          4840,
    configuration: { securityMode: 'None', securityPolicy: 'None' },
    isEnabled:     true,
  },
  {
    code:          'MODBUS_TCP_DEFAULT',
    name:          'Modbus TCP Default',
    protocol:      CommunicationProtocol.MODBUS_TCP,
    version:       null,
    endpoint:      'tcp://localhost',
    port:          502,
    configuration: { unitId: 1, timeout: 3000 },
    isEnabled:     true,
  },
  {
    code:          'MODBUS_RTU_COM1',
    name:          'Modbus RTU COM1',
    protocol:      CommunicationProtocol.MODBUS_RTU,
    version:       null,
    endpoint:      null,
    port:          null,
    configuration: { serialPort: 'COM1', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
    isEnabled:     false,
  },
  {
    code:          'HTTP_REST_DEFAULT',
    name:          'HTTP REST API',
    protocol:      CommunicationProtocol.HTTP,
    version:       '1.1',
    endpoint:      'http://localhost',
    port:          80,
    configuration: { timeout: 5000, retries: 3 },
    isEnabled:     true,
  },
];
