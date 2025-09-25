#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// Configuration WiFi
const char* ssid = "ESP8266_SOS";
const char* password = "12345678";

// Configuration du laser
const int LASER_PIN = D2;

// Configuration du serveur web
ESP8266WebServer server(80);

// Timing pour le morse (en millisecondes)
const int DOT_DURATION = 200;
const int DASH_DURATION = 600;
const int SYMBOL_SPACE = 200;
const int LETTER_SPACE = 600;
const int WORD_SPACE = 1400;

void setup() {
  Serial.begin(115200);

  // Configuration du pin laser
  pinMode(LASER_PIN, OUTPUT);
  digitalWrite(LASER_PIN, LOW);

  // Test du laser au démarrage
  Serial.println("Test laser...");
  digitalWrite(LASER_PIN, HIGH);
  delay(500);
  digitalWrite(LASER_PIN, LOW);
  delay(500);

  // Configuration du point d'accès WiFi
  Serial.println("Configuration du point d'accès...");
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("Point d'accès IP: ");
  Serial.println(IP);

  // Configuration des routes du serveur web
  server.on("/", handleRoot);
  server.on("/sos", handleSOS);
  server.on("/test", handleTest);
  server.on("/status", handleStatus);
  server.onNotFound(handleNotFound);

  // Démarrage du serveur
  server.begin();
  Serial.println("Serveur HTTP démarré");
  Serial.println("Utilisez: http://192.168.4.1/sos pour déclencher le SOS");
}

void loop() {
  server.handleClient();
}

// Page d'accueil
void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>ESP8266 SOS Laser</title></head>";
  html += "<body><h1>ESP8266 SOS Laser Controller</h1>";
  html += "<p><a href='/sos'><button style='padding:20px;font-size:18px;'>DÉCLENCHER SOS</button></a></p>";
  html += "<p><a href='/test'><button style='padding:20px;font-size:18px;'>TEST LASER</button></a></p>";
  html += "<p>Point d'accès: " + String(ssid) + "</p>";
  html += "</body></html>";

  server.send(200, "text/html", html);
}

// Déclenchement du SOS
void handleSOS() {
  Serial.println("SOS déclenché depuis l'API!");

  // Obtenir l'IP du client (votre API Docker)
  String clientIP = server.client().remoteIP().toString();

  // Envoyer la réponse HTTP d'abord
  String response = "{\"message\":\"SOS signal triggered via laser\",\"pattern\":\"... --- ...\",\"client_ip\":\"" + clientIP + "\",\"timestamp\":\"" + String(millis()) + "\",\"status\":\"success\"}";
  server.send(200, "application/json", response);

  // Puis exécuter le signal SOS
  sendSOSMorse();
}

// Test du laser
void handleTest() {
  Serial.println("Test laser déclenché!");

  // Test simple du laser
  digitalWrite(LASER_PIN, HIGH);
  delay(1000);
  digitalWrite(LASER_PIN, LOW);

  String response = "{\"message\":\"Laser test completed\",\"status\":\"success\"}";
  server.send(200, "application/json", response);
}

// Status de l'ESP8266
void handleStatus() {
  String response = "{\"device\":\"ESP8266_SOS_Laser\",\"uptime\":\"" + String(millis()) + "\",\"free_heap\":\"" + String(ESP.getFreeHeap()) + "\",\"connected_clients\":\"" + String(WiFi.softAPgetStationNum()) + "\",\"status\":\"online\"}";
  server.send(200, "application/json", response);
}

// Gestion des pages non trouvées
void handleNotFound() {
  server.send(404, "text/plain", "Page non trouvée");
}

// Fonction pour envoyer le signal SOS en morse
void sendSOSMorse() {
  // S = ... (3 points)
  sendMorseLetter("...");
  delay(LETTER_SPACE);

  // O = --- (3 traits)
  sendMorseLetter("---");
  delay(LETTER_SPACE);

  // S = ... (3 points)
  sendMorseLetter("...");
  delay(WORD_SPACE);

  Serial.println("SOS envoyé!");
}

// Fonction pour envoyer une lettre en morse
void sendMorseLetter(String morseCode) {
  for (int i = 0; i < morseCode.length(); i++) {
    if (morseCode.charAt(i) == '.') {
      // Point
      digitalWrite(LASER_PIN, HIGH);
      delay(DOT_DURATION);
      digitalWrite(LASER_PIN, LOW);
      delay(SYMBOL_SPACE);
    } else if (morseCode.charAt(i) == '-') {
      // Trait
      digitalWrite(LASER_PIN, HIGH);
      delay(DASH_DURATION);
      digitalWrite(LASER_PIN, LOW);
      delay(SYMBOL_SPACE);
    }
  }
}