#include <Servo.h>

Servo sorterServo;

const int servoPin = 9;        // Pin connected to servo

const int leftPos = 0;         // Fully left
const int rightPos = 180;      // Fully right

const int shakeAmplitude = 30; // Degrees to shake for getNextItem
const int shakeAmount = 6;     // Times the servo shakes
const int shakeDelay = 60;     // Time between the shakes

const int tiltShakeAmplitude = 10;
const int tiltShakeCount = 3;

String inputString = "";
bool stringComplete = false;

void setup() {
  Serial.begin(115200);
  sorterServo.attach(servoPin);
  sorterServo.write(90); 
  while (!Serial);
  Serial.println("Connection established!");
}

void loop() {
  delay(50);
}

bool isNumeric(String str) {
  for (unsigned int i = 0; i < str.length(); i++) {
    if (!isDigit(str[i])) return false;  
  }
  return str.length() > 0; 
}

void serialEvent() {
  String serialData = "";
  Serial.print("Received: ");
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    serialData += inChar;
    Serial.print(inChar);
  }
  Serial.println("");
  delay(50);
  handleSerialEvent(serialData);
}

void handleSerialEvent(String serialData) {
  if (isNumeric(serialData)) {
    int value = serialData.toInt();

    switch (value) {
      case 0:
        Serial.println("Case 0 triggered");
        getNextItem();
        Serial.println("Action done.");
        break;
      case 1:
        Serial.println("Case 1 triggered");
        sortRight();
        Serial.println("Action done.");
        break;
      case 2:
        Serial.println("Case 2 triggered");
        sortLeft();
        Serial.println("Action done.");
        break;
      default:
        Serial.println("Invalid action.");
        break;
    }

  } else {
    Serial.println("Invalid action.");
  }
}

void sortLeft() {
  int targetPos = leftPos;
  sorterServo.write(targetPos);
  delay(300);
  for (int i = 0; i < tiltShakeCount; i++) {
    sorterServo.write(targetPos + tiltShakeAmplitude);
    delay(50);
    sorterServo.write(targetPos - tiltShakeAmplitude);
    delay(50);
  }
  sorterServo.write(90);
}

void sortRight() {
  int targetPos = rightPos;
  sorterServo.write(targetPos);
  delay(300);
  for (int i = 0; i < tiltShakeCount; i++) {
    sorterServo.write(targetPos + tiltShakeAmplitude);
    delay(50);
    sorterServo.write(targetPos - tiltShakeAmplitude);
    delay(50);
  }
  sorterServo.write(90);
}

void getNextItem() {
  int currentPos = sorterServo.read();

  for (int i = 0; i < 5; i++) {
    sorterServo.write(currentPos + shakeAmplitude);
    delay(shakeDelay);
    sorterServo.write(currentPos - shakeAmplitude);
    delay(shakeDelay);
  }

  sorterServo.write(currentPos);
}
