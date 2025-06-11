import { Component, useState, mount } from "@odoo/owl";

// Eine einfache Owl-Komponente
class Counter extends Component {
  static template = `
    <div class="counter">
      <p>Zähler: <t t-esc="state.count"/></p>
      <button t-on-click="increment">Erhöhen</button>
    </div>
  `;

  setup() {
    this.state = useState({ count: 0 });
  }

  increment() {
    this.state.count++;
  }
}

// Funktion zum Mounten der Komponente
export function mountOwlApp(target) {
  mount(Counter, target);
} 