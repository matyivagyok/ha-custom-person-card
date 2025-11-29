# **Custom Person Card**

A modern, Mushroom-inspired person card for Home Assistant that combines presence status with battery monitoring.

## **Features**

* **Visual Editor:** Fully configurable via the Home Assistant UI (no YAML required\!).  
* **Mushroom Style:** Default vertical layout matches standard Mushroom cards perfectly.  
* **Battery Integration:** Shows battery percentage and dynamic icon color in the corner.  
* **Smart Fallback:** Shows the person's picture if available, or falls back to a themed icon.  
* **Layout Options:** Choose between "Vertical" (Square/Mushroom) or "Horizontal" (Wide) layouts.

## **Installation**

### **Via HACS (Recommended)**

1. Go to HACS \-\> Frontend.  
2. Click the 3 dots in the top right \-\> **Custom repositories**.  
3. Paste the URL of this repository.  
4. Select category: **Lovelace**.  
5. Click **Add**, then search for "Custom Person Card" and install.

### **Manual Installation**

1. Download custom-person-card.js.  
2. Upload it to your Home Assistant config/www/ folder.  
3. Add the resource in your Dashboard settings: /local/custom-person-card.js.

## **Configuration**

You can configure this card entirely using the **Visual Editor** in your Dashboard.

### **YAML Configuration**

If you prefer YAML, here is the syntax:  
type: custom:custom-person-card  
entity: person.example  
battery: sensor.example\_phone\_battery  
layout: vertical \# Options: vertical, horizontal  
name: "My Name" \# Optional override  
