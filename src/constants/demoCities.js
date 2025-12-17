/**
 * Demo Cities Configuration
 * Static cities with their coordinates for demo mode
 */

export const DEMO_CITIES = [
    {
        id: 1,
        name: 'London',
        location: 'Trafalgar Square',
        country: 'United Kingdom',
        latitude: 51.508071,
        longitude: -0.128020,
        radius: 2, // km - default radius
        description: 'Historic center of London'
    },
    {
        id: 2,
        name: 'Paris',
        location: 'Place de la Concorde',
        country: 'France',
        latitude: 48.865151,
        longitude: 2.321361,
        radius: 2, // km - default radius
        description: 'Heart of Paris'
    },
    {
        id: 3,
        name: 'New York',
        location: 'Manhattan',
        country: 'United States',
        latitude: 40.758896,
        longitude: -73.985130,
        radius: 2, // km - default radius
        description: 'Times Square area'
    },
    {
        id: 4,
        name: 'Tokyo',
        location: 'Shibuya',
        country: 'Japan',
        latitude: 35.661777,
        longitude: 139.704051,
        radius: 2, // km - default radius
        description: 'Shibuya crossing area'
    }
];

/**
 * Activity color codes for demo
 * Labels match the marker design: B, S, R, SER, GI, GR
 */
export const ACTIVITY_COLORS = {
    1: { color: '#001C64', label: 'B', name: 'Buy', short: 'BUY' },        // Dark Blue
    2: { color: '#69A7EF', label: 'S', name: 'Sell', short: 'SELL' },       // Light Blue
    3: { color: '#B2B2B2', label: 'R', name: 'Rent', short: 'RENT' },       // Light Grey
    4: { color: '#505050', label: 'SER', name: 'Service', short: 'SER' },  // Dark Grey
    5: { color: '#FFDE59', label: 'GI', name: 'Give', short: 'GIVE' },      // Gold
    6: { color: '#3FAF46', label: 'GR', name: 'Group', short: 'GRP' }      // Green
};

/**
 * Get default city (London)
 */
export const getDefaultCity = () => DEMO_CITIES[0];

/**
 * Get city by name
 */
export const getCityByName = (name) => {
    return DEMO_CITIES.find(city =>
        city.name.toLowerCase() === name.toLowerCase()
    ) || getDefaultCity();
};

/**
 * Get city by ID
 */
export const getCityById = (id) => {
    return DEMO_CITIES.find(city => city.id === id) || getDefaultCity();
};
