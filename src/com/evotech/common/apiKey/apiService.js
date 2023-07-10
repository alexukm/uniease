import {googleMapsApiKey} from "./mapsApiKey";
const apiService = {
    getAutocomplete: async (input) => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:my&key=${googleMapsApiKey}`);
        const data = await response.json();
        return data.predictions;
    },

    getLocationDetails: async (placeId) => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleMapsApiKey}`);
        const data = await response.json();
        return data.result.geometry.location;
    }
};

export default apiService;
