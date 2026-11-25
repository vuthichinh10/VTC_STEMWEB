UPDATE board_profiles
SET display_name = 'VTC STEM Core — mechanical model from core.step',
    notice = 'CORE.STEP MECHANICAL REFERENCE — GPIO MAP REMAINS DEMO UNTIL SCHEMATIC/NETLIST VERIFICATION'
WHERE id = 'esp32-wroom32-demo' AND version = 1;
