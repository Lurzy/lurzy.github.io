// Флаг: true — использовать локальные JSON из папки data/, false — загружать с CDN
const USE_LOCAL_DATA = false;

export const heroesUrl = USE_LOCAL_DATA ? './data/heroes.json' : 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/heroes.json';
export const abilitiesUrl = USE_LOCAL_DATA ? './data/abilities.json' : 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/abilities.json';
export const heroAbilitiesUrl = USE_LOCAL_DATA ? './data/hero_abilities.json' : 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/hero_abilities.json';
export const itemsUrl = USE_LOCAL_DATA ? './data/items.json' : 'https://cdn.jsdelivr.net/gh/odota/dotaconstants/build/items.json';

// Константы, используемые в проекте
export const CDN_BASE = 'https://cdn.cloudflare.steamstatic.com';
export const ROULETTE_SOUND_FILE = 'roulette_sound.mp3';
export const GAY_ROULETTE_SOUND_FILE = 'sergey.mp3';
export const GAY_HOVER_SOUND_FILE = 'click.mp3';

// Списки предметов
export const ALLOWED_ITEM_KEYS = new Set([
  'soul_ring', 'orb_of_corrosion', 'falcon_blade', 'power_treads', 'phase_boots', 'travel_boots',
  'mask_of_madness', 'hand_of_midas', 'helm_of_the_dominator', 'moon_shard', 'helm_of_the_overlord', 'travel_boots_2',
  'urn_of_shadows', 'tranquil_boots', 'pavise', 'arcane_boots', 'drum', 'mekansm', 'vladmir', 'spirit_vessel',
  'pipe', 'guardian_greaves', 'crimson_guard', 'boots_of_bearing', 'holy_locket', 'solar_crest',
  'veil_of_discord', 'glimmer_cape', 'force_staff', 'aether_lens', 'witch_blade', 'cyclone', 'rod_of_atos',
  'orchid', 'ultimate_scepter', 'nullifier', 'kaya', 'ethereal_blade', 'dagon', 'kaya_and_yasha', 'sange_and_kaya',
  'bloodstone', 'refresher', 'sheepstick', 'octarine_core', 'wind_waker', 'specialists_array',
  'vanguard', 'blade_mail', 'mage_slayer', 'soul_booster', 'lotus_orb', 'black_king_bar',
  'hurricane_pike', 'sphere', 'aeon_disk', 'shivas_guard', 'manta', 'heart', 'assault', 'bloodthorn',
  'crystalys', 'meteor_hammer', 'armlet', 'basher', 'shadow_blade', 'bfury', 'monkey_king_bar', 'maelstrom',
  'diffusal_blade', 'desolator', 'heavens_halberd', 'sange', 'yasha', 'sange_and_yasha', 'echo_sabre',
  'silver_edge', 'radiance', 'abyssal_blade', 'disperser', 'greater_crit',
  'dragon_lance', 'kaya_and_sange', 'harpoon', 'satanic', 'khanda', 'mjollnir', 'skadi', 'butterfly',
  'rapier', 'parasma', 'overwhelming_blink', 'swift_blink', 'arcane_blink', 'hydras_breath', 'blink',
  'boots', 'aghanims_shard'
]);

export const BOOTS_ITEM_KEYS = new Set([
  'arcane_boots', 'travel_boots', 'travel_boots_2', 'boots', 'boots_of_bearing', 'tranquil_boots', 'phase_boots', 'power_treads', 'guardian_greaves'
]);

export const MAX_REPLACES = 10;
export const MAX_BUILDS = 5;

// Глобальные переменные состояния
window.rouletteAudio = null;
window.gayAudio = null;
window.hoverAudio = null;
window.heroesData = [];
window.bootsData = [];
window.regularItemsData = [];
window.isDataLoaded = false;
window.builds = [];
window.previousBuilds = [];
window.activeBuildIndex = 0;
window.replaceCount = 0;
window.isRouletteActive = false;
window.draggedItemIndex = null;
window.isShareAnimating = false;
window.recentRegularItems = [];
window.isGayMode = false;
window.parallaxX = 0;
window.parallaxY = 0;
window.hiddenHeroId = '';
window.hiddenItemQuery = '';
window.altPressed = false; // изменено с ctrlPressed
window.forcedItemKey = null;
window.particlesColor = { r: 192, g: 132, b: 252 };