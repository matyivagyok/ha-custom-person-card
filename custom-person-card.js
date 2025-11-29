/* jshint esversion: 11 */

// Version print to console - helps debug caching issues
console.info(
  `%c  CUSTOM-PERSON-CARD  \n%c  Version 0.1.0       `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

class CustomPersonCard extends HTMLElement {
  // 1. Define the Visual Editor
  static getConfigElement() {
    return document.createElement("custom-person-card-editor");
  }

  static getStubConfig() {
    return { entity: "person.example", layout: "vertical" };
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            <div class="entity-image-container">
              <img id="person-img" src="" alt="Person" />
              <ha-icon id="person-icon" icon="mdi:account"></ha-icon>
            </div>
            <div class="info-container">
              <div class="name" id="person-name"></div>
              <div class="location-state" id="person-state"></div>
            </div>
            <div class="battery-container">
              <span id="battery-level"></span>
              <ha-icon id="battery-icon"></ha-icon>
            </div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector("div.card-content");

      const style = document.createElement('style');
      style.textContent = `
        ha-card {
          cursor: pointer; 
          transition: box-shadow 0.15s ease-in-out;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          background: var(--ha-card-background, var(--card-background-color, white));
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, none);
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
          display: flex;
          flex-direction: column;
        }
        .card-content {
          display: flex;
          align-items: center;
          padding: 16px;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          position: relative; 
        }
        
        /* Layout: Horizontal */
        .card-content.layout-horizontal {
          flex-direction: row;
          justify-content: space-between;
          text-align: left;
        }
        .layout-horizontal .entity-image-container {
          margin-right: 16px;
        }
        .layout-horizontal .info-container {
          align-items: flex-start;
        }
        .layout-horizontal .battery-container {
          margin-left: auto; 
        }

        /* Layout: Vertical (Mushroom) */
        .card-content.layout-vertical {
          flex-direction: column;
          justify-content: center;
          text-align: center;
          /* Padding bottom reduced from 28px to 16px to match top padding */
          padding-bottom: 16px; 
        }
        .layout-vertical .entity-image-container {
          margin-bottom: 8px;
          margin-right: 0;
        }
        .layout-vertical .info-container {
          align-items: center;
          width: 100%;
        }
        .layout-vertical .battery-container {
          position: absolute;
          bottom: 8px;
          right: 8px;
          font-size: 12px;
        }
        
        /* Image Container */
        .entity-image-container {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          overflow: hidden;
          background: transparent; /* Default transparent */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0; 
        }
        /* Only show background if it's an icon */
        .entity-image-container.is-icon {
          background: var(--secondary-background-color);
        }

        .entity-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: none; 
        }
        .entity-image-container ha-icon {
          color: var(--primary-text-color);
          display: none;
        }
        
        .info-container {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0; 
        }
        .name {
          font-weight: 500;
          font-size: 14px;
          color: var(--primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .location-state {
          font-size: 12px;
          color: var(--primary-text-color);
          text-transform: capitalize;
          margin-top: 2px;
        }
        .battery-container {
          display: flex;
          align-items: center;
          color: var(--primary-text-color);
        }
        .battery-container span {
          font-size: 12px;
          margin-right: 4px;
          font-weight: 500;
        }
        .battery-high { color: var(--success-color, #4caf50); }
        .battery-med { color: var(--warning-color, #ff9800); }
        .battery-low { color: var(--error-color, #f44336); }
      `;
      this.appendChild(style);

      this.addEventListener('click', () => {
        this._fire('hass-more-info', { entityId: this.config.entity });
      });
    }

    const cardContent = this.querySelector('.card-content');
    if (this.config.layout === 'horizontal') {
        cardContent.classList.remove('layout-vertical');
        cardContent.classList.add('layout-horizontal');
    } else {
        cardContent.classList.remove('layout-horizontal');
        cardContent.classList.add('layout-vertical');
    }

    const personEntity = hass.states[this.config.entity];
    const batteryEntity = this.config.battery ? hass.states[this.config.battery] : null;

    if (personEntity) {
      const name = this.config.name || personEntity.attributes.friendly_name;
      this.querySelector('#person-name').innerText = name;

      const state = personEntity.state;
      this.querySelector('#person-state').innerText = state === 'not_home' ? 'Away' : state;

      const imgEl = this.querySelector('#person-img');
      const iconEl = this.querySelector('#person-icon');
      const containerEl = this.querySelector('.entity-image-container');
      
      if (personEntity.attributes.entity_picture) {
        imgEl.src = personEntity.attributes.entity_picture;
        imgEl.style.display = 'block';
        iconEl.style.display = 'none';
        containerEl.classList.remove('is-icon'); 
      } else {
        imgEl.style.display = 'none';
        iconEl.style.display = 'block';
        containerEl.classList.add('is-icon'); 
      }
    }

    if (batteryEntity) {
      const level = parseInt(batteryEntity.state);
      const batteryLevelEl = this.querySelector('#battery-level');
      const batteryIconEl = this.querySelector('#battery-icon');
      
      if (!isNaN(level)) {
        batteryLevelEl.innerText = `${level}%`;
        
        let icon = 'mdi:battery';
        if (level >= 95) icon = 'mdi:battery';
        else if (level >= 85) icon = 'mdi:battery-90';
        else if (level >= 75) icon = 'mdi:battery-80';
        else if (level >= 65) icon = 'mdi:battery-70';
        else if (level >= 55) icon = 'mdi:battery-60';
        else if (level >= 45) icon = 'mdi:battery-50';
        else if (level >= 35) icon = 'mdi:battery-40';
        else if (level >= 25) icon = 'mdi:battery-30';
        else if (level >= 15) icon = 'mdi:battery-20';
        else icon = 'mdi:battery-outline';

        if (batteryEntity.attributes.device_class === 'battery' && batteryEntity.state === 'charging') {
           icon = 'mdi:battery-charging'; 
        }

        batteryIconEl.setAttribute('icon', icon);
        batteryIconEl.classList.remove('battery-high', 'battery-med', 'battery-low');
        if (level > 50) batteryIconEl.classList.add('battery-high');
        else if (level > 20) batteryIconEl.classList.add('battery-med');
        else batteryIconEl.classList.add('battery-low');
        
        this.querySelector('.battery-container').style.display = 'flex';
      }
    } else {
      this.querySelector('.battery-container').style.display = 'none';
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity (person)');
    }
    this.config = config;
  }

  getCardSize() {
    return 1;
  }
  
  getLayoutOptions() {
    return {
      grid_rows: 2,
      grid_columns: 2,
      grid_min_rows: 1,
      grid_min_columns: 1,
    };
  }

  _fire(type, detail) {
    const event = new Event(type, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    event.detail = detail || {};
    this.dispatchEvent(event);
  }
}

// --- The Visual Editor Class (FIXED) ---
class CustomPersonCardEditor extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    // 1. Pass hass down to the pickers immediately if they exist
    const entityPicker = this.querySelector(".person-picker");
    const batteryPicker = this.querySelector(".battery-picker");
    
    if (entityPicker) entityPicker.hass = hass;
    if (batteryPicker) batteryPicker.hass = hass;
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  render() {
    // If the elements already exist, we don't need to rebuild the DOM.
    if (this.querySelector(".person-picker")) {
      return; 
    }

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
        
        <div>
           <ha-entity-picker 
              class="person-picker" 
              label="Entity (Person)" 
              allow-custom-entity
              item-label-path="entity_id">
           </ha-entity-picker>
        </div>

        <div>
           <ha-entity-picker 
              class="battery-picker" 
              label="Battery Sensor" 
              allow-custom-entity
              item-label-path="entity_id">
           </ha-entity-picker>
        </div>

        <ha-textfield class="name-input" label="Name Override (Optional)"></ha-textfield>

        <div style="display:flex; flex-direction:column;">
          <label style="color: var(--secondary-text-color); font-size: 12px; margin-bottom: 4px;">Layout</label>
          <select class="layout-select" style="padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color);">
            <option value="vertical">Vertical (Mushroom)</option>
            <option value="horizontal">Horizontal (Wide)</option>
          </select>
        </div>
      </div>
    `;

    // --- Javascript Logic ---
    
    // 1. Entity Picker (Person)
    const entityPicker = this.querySelector(".person-picker");
    // Added input_boolean and binary_sensor to help testing if you don't have person entities ready
    entityPicker.includeDomains = ["person", "input_boolean", "binary_sensor", "device_tracker"]; 
    entityPicker.value = this._config.entity || '';
    
    // 2. Battery Picker
    const batteryPicker = this.querySelector(".battery-picker");
    batteryPicker.includeDomains = ["sensor"]; 
    batteryPicker.value = this._config.battery || '';

    // 3. Name Input
    const nameInput = this.querySelector(".name-input");
    nameInput.value = this._config.name || '';

    // 4. Layout Select
    const layoutSelect = this.querySelector(".layout-select");
    layoutSelect.value = this._config.layout || 'vertical';

    // IMPORTANT: Set hass immediately if we have it to avoid the "timing" bug
    if (this._hass) {
      entityPicker.hass = this._hass;
      batteryPicker.hass = this._hass;
    }

    // --- Event Listeners ---
    entityPicker.addEventListener("value-changed", (ev) => this._valueChanged(ev, "entity"));
    batteryPicker.addEventListener("value-changed", (ev) => this._valueChanged(ev, "battery"));
    nameInput.addEventListener("input", (ev) => this._valueChanged(ev, "name"));
    layoutSelect.addEventListener("change", (ev) => this._valueChanged(ev, "layout"));
  }

  _valueChanged(ev, key) {
    if (!this._config || !this.parentElement) return;
    
    let value;
    if (ev.detail && ev.detail.value !== undefined) {
        value = ev.detail.value; 
    } else {
        value = ev.target.value; 
    }

    if (this._config[key] === value) return;

    const newConfig = {
        ...this._config,
        [key]: value
    };

    const event = new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('custom-person-card-editor', CustomPersonCardEditor);
customElements.define('custom-person-card', CustomPersonCard);