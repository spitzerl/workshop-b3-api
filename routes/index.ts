import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
	res.json({ status: 'ok' });
});

router.get('/sos', async (_req: Request, res: Response) => {
	try {
		// IP de l'ESP8266 (point d'accès)
		const ESP_IP = '192.168.4.1';

		// Appel HTTP vers l'ESP8266
		const response = await fetch(`http://${ESP_IP}/sos`, {
			method: 'GET'
		});

		if (response.ok) {
			const espData = await response.json();
			res.json({
				message: 'SOS déclenché via ESP8266',
				esp_response: espData,
				esp_ip: ESP_IP,
				status: 'success'
			});
		} else {
			res.status(502).json({
				message: 'Erreur communication avec ESP8266',
				esp_ip: ESP_IP,
				status: 'error'
			});
		}
	} catch (error) {
		res.status(500).json({
			message: 'ESP8266 non accessible',
			error: 'Vérifiez que vous êtes connecté au WiFi ESP8266_SOS',
			esp_ip: '192.168.4.1',
			status: 'error'
		});
	}
});

router.get('/esp-status', async (_req: Request, res: Response) => {
	try {
		const ESP_IP = '192.168.4.1';

		const response = await fetch(`http://${ESP_IP}/status`, {
			method: 'GET'
		});

		if (response.ok) {
			const espData = await response.json();
			res.json({
				message: 'ESP8266 accessible',
				esp_data: espData,
				esp_ip: ESP_IP,
				status: 'online'
			});
		} else {
			res.status(502).json({
				message: 'ESP8266 ne répond pas correctement',
				esp_ip: ESP_IP,
				status: 'error'
			});
		}
	} catch (error) {
		res.status(500).json({
			message: 'ESP8266 non accessible',
			error: 'Vérifiez que vous êtes connecté au WiFi ESP8266_SOS',
			esp_ip: '192.168.4.1',
			status: 'offline'
		});
	}
});

router.get('/test', async (_req: Request, res: Response) => {
	try {
		const ESP_IP = '192.168.4.1';

		const response = await fetch(`http://${ESP_IP}/test`, {
			method: 'GET'
		});

		if (response.ok) {
			const espData = await response.json();
			res.json({
				message: 'Test déclenché via ESP8266',
				esp_response: espData,
				esp_ip: ESP_IP,
				status: 'success'
			});
		} else {
			res.status(502).json({
				message: 'Erreur communication avec ESP8266',
				esp_ip: ESP_IP,
				status: 'error'
			});
		}
	} catch (error) {
		res.status(500).json({
			message: 'ESP8266 non accessible',
			error: 'Vérifiez que vous êtes connecté au WiFi ESP8266_SOS',
			esp_ip: '192.168.4.1',
			status: 'error'
		});
	}
});

export default router;
