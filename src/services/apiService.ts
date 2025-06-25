// src/services/apiService.ts
// Servicio base para llamadas REST al backend AirSafe
// 🔧 COMPLETAR: Configura baseUrl y apiKey en CONFIG.ts

import { CONFIG } from '../constants/CONFIG';

export const apiService = {
  async get(path: string) {
    const res = await fetch(`${CONFIG.api.baseUrl}${path}`, {
      headers: { 'x-api-key': CONFIG.api.apiKey },
    });
    return res.json();
  },
  async post(path: string, data: any) {
    const res = await fetch(`${CONFIG.api.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.api.apiKey,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
