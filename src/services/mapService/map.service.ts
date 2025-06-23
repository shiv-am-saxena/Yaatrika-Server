import axios from 'axios';
import ApiError from '../../utils/ApiError.js';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export class MapService {
    static async getGeolocation(address: string): Promise<{ lat: number; lng: number }> {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new ApiError(500, 'Google Maps API key is not set');
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const params = {
            address,
            key: GOOGLE_MAPS_API_KEY,
        };

        const response = await axios.get(url, { params });

        if (
            response.data.status !== 'OK' ||
            !response.data.results ||
            response.data.results.length === 0
        ) {
            throw new ApiError(400, 'Unable to fetch coordinates for the requested address.');
        }

        const location = response.data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
    }
    static async getTimeDistance(origin: string, destination: string): Promise<{ duration: string; distance: string }> {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new ApiError(500, 'Google Maps API key is not set');
        }

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
        const params = {
            origins: origin,
            destinations: destination,
            key: GOOGLE_MAPS_API_KEY,
        };

        const response = await axios.get(url, { params });

        if (
            response.data.status !== 'OK' ||
            !response.data.rows ||
            response.data.rows.length === 0 ||
            !response.data.rows[0].elements ||
            response.data.rows[0].elements.length === 0 ||
            response.data.rows[0].elements[0].status !== 'OK'
        ) {
            throw new ApiError(400, 'Unable to fetch time and distance for the requested route.');
        }

        const element = response.data.rows[0].elements[0];
        return {
            duration: element.duration,
            distance: element.distance,
        };
    }
    static async autocompleteInput(input: string): Promise<string[]> {
        if (!GOOGLE_MAPS_API_KEY) {
            throw new ApiError(500, 'Google Maps API key is not set');
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
        const params = {
            input,
            key: GOOGLE_MAPS_API_KEY,
        };

        const response = await axios.get(url, { params });

        if (
            response.data.status !== 'OK' ||
            !response.data.predictions ||
            response.data.predictions.length === 0
        ) {
            throw new ApiError(400, 'Unable to fetch autocomplete suggestions.');
        }

        return response.data.predictions.map((prediction: any) => prediction);
    }
}