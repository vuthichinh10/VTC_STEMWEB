import { useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { validateCircuit } from './compatibility';
import type { CircuitBuilderProps } from './CircuitBuilder.types';

const palette = {
  navy: '#153D32',
  blue: '#2F8F68',
  blueSoft: '#E8F7EF',
  border: '#D9EAE1',
  text: '#173A2E',
  muted: '#667C73',
  success: '#21855F',
  danger: '#CC5361',
  warning: '#9D6B20',
  white: '#FFFFFF',
};

type DragPayload = { moduleId: string; instanceId?: string };

export function CircuitBuilder({ board, moduleIds, specs, value, onChange }: CircuitBuilderProps) {
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [selected, setSelected] = useState<DragPayload | null>(null);
  const lessonSpecs = useMemo(
    () => moduleIds.flatMap((id) => specs.filter((spec) => spec.id === id)),
    [moduleIds, specs],
  );
  const issues = useMemo(() => validateCircuit(board, specs, value), [board, specs, value]);
  const active = dragging ?? selected;

  const startDrag = (event: DragEvent, payload: DragPayload) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/stem-module', JSON.stringify(payload));
    setDragging(payload);
  };
  const dropOnPin = (event: DragEvent, gpio: number) => {
    event.preventDefault();
    let payload = dragging;
    try {
      payload = JSON.parse(event.dataTransfer.getData('application/stem-module')) as DragPayload;
    } catch {
      /* use current drag */
    }
    if (!payload) return;
    if (payload.instanceId)
      onChange(
        value.map((item) => (item.instanceId === payload.instanceId ? { ...item, gpio } : item)),
      );
    else
      onChange([
        ...value,
        { instanceId: `${payload.moduleId}-${Date.now()}`, moduleId: payload.moduleId, gpio },
      ]);
    setDragging(null);
    setSelected(null);
  };
  const placeSelected = (gpio: number) => {
    if (!selected) return;
    if (selected.instanceId)
      onChange(
        value.map((item) => (item.instanceId === selected.instanceId ? { ...item, gpio } : item)),
      );
    else
      onChange([
        ...value,
        { instanceId: `${selected.moduleId}-${Date.now()}`, moduleId: selected.moduleId, gpio },
      ]);
    setSelected(null);
  };
  const specFor = (moduleId: string) => specs.find((spec) => spec.id === moduleId);

  return (
    <div style={s.root}>
      <section style={s.palettePanel} aria-label="Kho module bài học">
        <div style={s.sectionEyebrow}>KHO MODULE</div>
        <h3 style={s.heading}>Kéo module vào chân GPIO</h3>
        <p style={s.help}>
          Kéo thẻ sang board hoặc chọn thẻ rồi bấm một chân. Hệ thống sẽ kiểm tra khả năng của GPIO.
        </p>
        <div style={s.moduleList}>
          {lessonSpecs.map((spec, index) => (
            <button
              key={`${spec.id}-${index}`}
              draggable
              onDragStart={(event) => startDrag(event, { moduleId: spec.id })}
              onDragEnd={() => setDragging(null)}
              onClick={() => setSelected({ moduleId: spec.id })}
              style={{
                ...s.moduleCard,
                ...(active?.moduleId === spec.id && !active.instanceId ? s.moduleSelected : {}),
              }}
              aria-label={`Kéo ${spec.name} vào board`}
            >
              <span style={s.moduleIcon}>{spec.emoji}</span>
              <span style={s.moduleCopy}>
                <strong style={s.moduleName}>{spec.name}</strong>
                <small style={s.moduleRequirement}>
                  Cần {capabilityName(spec.requiredCapability)}
                </small>
              </span>
              <span style={s.dragHandle}>⋮⋮</span>
            </button>
          ))}
        </div>
        <div style={s.safety}>
          <strong>Gợi ý an toàn</strong>
          <span>
            Đây là sơ đồ logic. Luôn kiểm tra điện trở, nguồn và pinout trước khi lắp mạch thật.
          </span>
        </div>
      </section>

      <section style={s.boardPanel} aria-label="Board ESP32 mô phỏng đấu nối">
        <div style={s.boardHeader}>
          <div>
            <div style={s.boardKicker}>BOARD PROFILE · V{board.version}</div>
            <h3 style={s.boardTitle}>{board.displayName}</h3>
          </div>
          <span style={s.voltage}>{board.logicVoltage}V LOGIC</span>
        </div>
        <div style={s.demoNotice}>{board.notice}</div>
        <div style={s.boardArea}>
          <div style={s.pinColumn}>
            {board.pins
              .filter((_, index) => index % 2 === 0)
              .map((pin) => (
                <PinDrop
                  key={pin.gpio}
                  pin={pin}
                  activeModuleId={active?.moduleId}
                  specs={specs}
                  connected={value.filter((item) => item.gpio === pin.gpio)}
                  onDrop={dropOnPin}
                  onClick={placeSelected}
                  onDragStart={startDrag}
                  onRemove={(id) => onChange(value.filter((item) => item.instanceId !== id))}
                />
              ))}
          </div>
          <div style={s.chip} aria-label="VTC STEM Core PCB derived from core.step">
            <div style={s.screen}>
              <span>DISPLAY</span>
              <small>TOUCH</small>
            </div>
            <div style={s.usb}>USB‑C</div>
            <div style={s.coreTop}>
              <span style={s.radio}>AP62xx</span>
              <span style={s.ipex}>IPEX</span>
            </div>
            <div style={s.chipMark}>VTC STEM</div>
            <div style={s.chipSub}>CORE BOARD</div>
            <div style={s.icGrid}>
              {['U1', 'U2', 'U3', 'U4', 'U5', 'U6'].map((name) => (
                <span key={name} style={s.ic}>
                  {name}
                </span>
              ))}
            </div>
            <div style={s.connectors}>
              {['J1', 'J2', 'J3', 'J4', 'J5'].map((name) => (
                <span key={name} style={s.connector}>
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div style={s.pinColumn}>
            {board.pins
              .filter((_, index) => index % 2 === 1)
              .map((pin) => (
                <PinDrop
                  key={pin.gpio}
                  pin={pin}
                  activeModuleId={active?.moduleId}
                  specs={specs}
                  connected={value.filter((item) => item.gpio === pin.gpio)}
                  onDrop={dropOnPin}
                  onClick={placeSelected}
                  onDragStart={startDrag}
                  onRemove={(id) => onChange(value.filter((item) => item.instanceId !== id))}
                />
              ))}
          </div>
        </div>
        <div style={s.legend}>
          <span>
            <i style={{ ...s.dot, background: palette.success }} /> Phù hợp
          </span>
          <span>
            <i style={{ ...s.dot, background: palette.warning }} /> Có lưu ý
          </span>
          <span>
            <i style={{ ...s.dot, background: palette.danger }} /> Không phù hợp
          </span>
        </div>
      </section>

      <section style={s.resultPanel} aria-live="polite">
        <div>
          <div style={s.sectionEyebrow}>KIỂM TRA KẾT NỐI</div>
          <strong style={s.resultTitle}>
            {value.length === 0
              ? 'Chưa lắp module'
              : issues.some((issue) => issue.severity === 'ERROR')
                ? 'Mạch cần điều chỉnh'
                : 'Kết nối logic hợp lệ'}
          </strong>
        </div>
        <div style={s.issueList}>
          {value.length === 0 ? (
            <span style={s.emptyResult}>Hãy kéo module đầu tiên lên board.</span>
          ) : issues.length === 0 ? (
            <span style={s.ok}>✓ Các module đang dùng đúng khả năng GPIO.</span>
          ) : (
            issues.map((issue, index) => (
              <span
                key={`${issue.code}-${index}`}
                style={issue.severity === 'ERROR' ? s.bad : s.caution}
              >
                {issue.severity === 'ERROR' ? '⛔' : '⚠'} {issue.message}
                {issue.suggestedPins.length
                  ? ` Gợi ý GPIO${issue.suggestedPins.join(', GPIO')}.`
                  : ''}
              </span>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function PinDrop({
  pin,
  activeModuleId,
  specs,
  connected,
  onDrop,
  onClick,
  onDragStart,
  onRemove,
}: {
  pin: CircuitBuilderProps['board']['pins'][number];
  activeModuleId?: string;
  specs: CircuitBuilderProps['specs'];
  connected: CircuitBuilderProps['value'];
  onDrop: (event: DragEvent, gpio: number) => void;
  onClick: (gpio: number) => void;
  onDragStart: (event: DragEvent, payload: DragPayload) => void;
  onRemove: (id: string) => void;
}) {
  const spec = specs.find((item) => item.id === activeModuleId);
  const compatible = !spec || (!pin.reserved && pin.capabilities.includes(spec.requiredCapability));
  const stateStyle = spec ? (compatible ? s.pinSuggested : s.pinRejected) : {};
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => onDrop(event, pin.gpio)}
      onClick={() => onClick(pin.gpio)}
      style={{ ...s.pin, ...stateStyle }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick(pin.gpio);
      }}
      title={`${pin.label}: ${pin.capabilities.map(capabilityName).join(', ')}`}
    >
      <div style={s.pinTop}>
        <strong style={s.pinLabel}>{pin.label}</strong>
        <span
          style={{
            ...s.pinState,
            color: spec ? (compatible ? palette.success : palette.danger) : palette.muted,
          }}
        >
          {spec ? (compatible ? 'Nên dùng' : 'Không hợp') : capabilityName(pin.capabilities[0])}
        </span>
      </div>
      <div style={s.capabilities}>
        {pin.capabilities.slice(0, 3).map((capability) => (
          <span key={capability} style={s.capability}>
            {shortCapability(capability)}
          </span>
        ))}
      </div>
      {connected.map((item) => {
        const itemSpec = specs.find((candidate) => candidate.id === item.moduleId);
        return (
          <div
            key={item.instanceId}
            draggable
            onDragStart={(event) => {
              event.stopPropagation();
              onDragStart(event, { moduleId: item.moduleId, instanceId: item.instanceId });
            }}
            style={s.connected}
          >
            <span>
              {itemSpec?.emoji} {itemSpec?.name}
            </span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRemove(item.instanceId);
              }}
              style={s.remove}
              aria-label={`Gỡ ${itemSpec?.name}`}
            >
              ×
            </button>
          </div>
        );
      })}
      {pin.warning && <small style={s.pinWarning}>{pin.warning}</small>}
    </div>
  );
}

function capabilityName(value: string) {
  return (
    (
      {
        'digital-in': 'đầu vào số',
        'digital-out': 'đầu ra số',
        pwm: 'PWM',
        adc: 'ADC',
        'i2c-sda': 'I²C SDA',
        'i2c-scl': 'I²C SCL',
      } as Record<string, string>
    )[value] ?? value
  );
}
function shortCapability(value: string) {
  return (
    (
      {
        'digital-in': 'IN',
        'digital-out': 'OUT',
        pwm: 'PWM',
        adc: 'ADC',
        'i2c-sda': 'SDA',
        'i2c-scl': 'SCL',
      } as Record<string, string>
    )[value] ?? value
  );
}

const s: Record<string, CSSProperties> = {
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
    gap: 16,
    width: '100%',
  },
  palettePanel: {
    background: palette.white,
    border: `1px solid ${palette.border}`,
    borderRadius: 18,
    padding: 20,
  },
  sectionEyebrow: { fontSize: 10, fontWeight: 900, letterSpacing: 1.3, color: palette.blue },
  heading: { margin: '6px 0', fontSize: 18, color: palette.text },
  help: { margin: '0 0 16px', color: palette.muted, fontSize: 13, lineHeight: 1.5 },
  moduleList: { display: 'grid', gap: 9 },
  moduleCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: `1px solid ${palette.border}`,
    borderRadius: 12,
    padding: '11px 12px',
    background: palette.white,
    cursor: 'grab',
    textAlign: 'left',
  },
  moduleSelected: { borderColor: palette.blue, boxShadow: `0 0 0 3px ${palette.blueSoft}` },
  moduleIcon: { fontSize: 25 },
  moduleCopy: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  moduleName: { color: palette.text, fontSize: 13 },
  moduleRequirement: { color: palette.muted },
  dragHandle: { color: '#91A79D', fontWeight: 900 },
  safety: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 16,
    padding: 12,
    borderRadius: 11,
    background: '#FFF8E8',
    color: palette.warning,
    fontSize: 12,
    lineHeight: 1.45,
  },
  boardPanel: {
    background: palette.navy,
    borderRadius: 18,
    padding: 20,
    color: palette.white,
    boxShadow: '0 14px 35px rgba(21,61,50,.14)',
    gridColumn: 'span 2',
  },
  boardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  boardKicker: { fontSize: 9, fontWeight: 900, letterSpacing: 1.2, color: '#BCE4D2' },
  boardTitle: { fontSize: 18, margin: '5px 0 0' },
  voltage: {
    fontSize: 10,
    fontWeight: 900,
    background: '#285B4B',
    borderRadius: 999,
    padding: '6px 9px',
    color: '#DDF4E9',
  },
  demoNotice: { fontSize: 10, color: '#FFD991', marginTop: 8 },
  boardArea: {
    display: 'grid',
    gridTemplateColumns: 'minmax(130px,1fr) minmax(110px,150px) minmax(130px,1fr)',
    gap: 12,
    alignItems: 'stretch',
    marginTop: 16,
  },
  pinColumn: { display: 'grid', gap: 8 },
  pin: {
    minHeight: 72,
    background: '#204E40',
    border: '1px dashed #5D947F',
    borderRadius: 11,
    padding: 9,
    cursor: 'pointer',
    transition: 'all .16s ease',
  },
  pinSuggested: {
    border: `1px solid ${palette.success}`,
    background: '#173F42',
    boxShadow: '0 0 0 2px rgba(21,151,110,.15)',
  },
  pinRejected: { border: `1px solid ${palette.danger}`, background: '#492D3E' },
  pinTop: { display: 'flex', justifyContent: 'space-between', gap: 6 },
  pinLabel: { fontSize: 11, color: '#fff' },
  pinState: { fontSize: 9, fontWeight: 800 },
  capabilities: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 },
  capability: {
    fontSize: 8,
    fontWeight: 900,
    color: '#C7E5D8',
    background: '#173D32',
    padding: '3px 5px',
    borderRadius: 5,
  },
  pinWarning: { display: 'block', fontSize: 9, color: '#FFD991', marginTop: 6, lineHeight: 1.35 },
  connected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    padding: '6px 7px',
    borderRadius: 7,
    background: palette.white,
    color: palette.text,
    fontSize: 10,
    fontWeight: 800,
    cursor: 'grab',
  },
  remove: {
    border: 0,
    background: '#FFE8EC',
    color: palette.danger,
    borderRadius: 999,
    width: 20,
    height: 20,
    cursor: 'pointer',
    fontWeight: 900,
  },
  chip: {
    minHeight: 300,
    borderRadius: 14,
    border: '7px solid #31527E',
    background: 'linear-gradient(160deg,#315C52,#173D38)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 0 0 2px #678D85',
    padding: 8,
    position: 'relative',
  },
  screen: {
    width: '82%',
    height: 58,
    border: '4px solid #1A2433',
    background: 'linear-gradient(135deg,#162C51,#4E6E9D)',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.2,
  },
  usb: {
    position: 'absolute',
    bottom: -7,
    left: '36%',
    background: '#D3D9E2',
    color: '#3B485B',
    borderRadius: '7px 7px 0 0',
    padding: '6px 14px',
    fontWeight: 900,
    fontSize: 10,
  },
  coreTop: { display: 'flex', justifyContent: 'space-between', width: '82%', marginTop: 10 },
  radio: { background: '#1C2631', padding: '5px 7px', fontSize: 8, borderRadius: 3 },
  ipex: { border: '2px solid #D5BD68', borderRadius: 99, padding: '3px 5px', fontSize: 7 },
  chipMark: { fontSize: 13, fontWeight: 900, letterSpacing: 1, marginTop: 9 },
  chipSub: { fontSize: 8, color: '#B6D4CC', marginTop: 2 },
  icGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 4,
    width: '78%',
    marginTop: 8,
  },
  ic: {
    background: '#202A2A',
    border: '1px solid #556A62',
    fontSize: 7,
    textAlign: 'center',
    padding: '5px 2px',
  },
  connectors: { display: 'flex', gap: 3, marginTop: 8 },
  connector: {
    background: '#ECE8D5',
    color: '#344238',
    fontSize: 7,
    fontWeight: 900,
    padding: '4px 5px',
    borderRadius: 2,
  },
  legend: {
    display: 'flex',
    gap: 15,
    flexWrap: 'wrap',
    fontSize: 10,
    color: '#C7E5D8',
    marginTop: 14,
  },
  dot: { display: 'inline-block', width: 7, height: 7, borderRadius: 99, marginRight: 5 },
  resultPanel: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'minmax(180px,220px) 1fr',
    gap: 18,
    alignItems: 'center',
    background: palette.white,
    border: `1px solid ${palette.border}`,
    borderRadius: 16,
    padding: '15px 18px',
  },
  resultTitle: { display: 'block', color: palette.text, marginTop: 4 },
  issueList: { display: 'grid', gap: 5 },
  emptyResult: { color: palette.muted, fontSize: 12 },
  ok: { color: palette.success, fontWeight: 800, fontSize: 12 },
  bad: { color: palette.danger, fontWeight: 700, fontSize: 12 },
  caution: { color: palette.warning, fontWeight: 700, fontSize: 12 },
};
