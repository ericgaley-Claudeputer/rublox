// Injected before page scripts: a virtual "standard" Xbox pad driven by window.__pad.
(() => {
  const st = { connected: false, buttons: new Array(17).fill(0), axes: [0, 0, 0, 0], ts: 0 };
  window.__pad = {
    connect(){ st.connected = true; try { window.dispatchEvent(new Event('gamepadconnected')); } catch (e){} },
    set(i, v){ st.buttons[i] = v ? 1 : 0; st.ts++; },
    axis(i, v){ st.axes[i] = v; st.ts++; },
    clear(){ st.buttons.fill(0); st.axes.fill(0); st.ts++; },
  };
  const pad = () => ({ id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)', index: 0, connected: true, mapping: 'standard', timestamp: st.ts,
    axes: st.axes.slice(), buttons: st.buttons.map(v => ({ pressed: v > .5, touched: v > 0, value: v })) });
  navigator.getGamepads = () => st.connected ? [pad(), null, null, null] : [null, null, null, null];
})();
