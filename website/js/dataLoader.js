// Monroe County MC3 Summit 2025 - Data Loader Module

/**
 * Data Loader for Monroe County datasets
 * Handles loading, parsing, and processing of CSV/Excel data
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.baseDataPath = window.location.pathname.includes('/pages/') ? '../' : '';
        this.processingFunctions = new Map();
        
        this.initializeProcessingFunctions();
    }

    /**
     * Initialize data processing functions for different dataset types
     */
    initializeProcessingFunctions() {
        // ACS data processing
        this.processingFunctions.set('acs', this.processACSData.bind(this));
        
        // Excel data processing
        this.processingFunctions.set('excel', this.processExcelData.bind(this));
        
        // Shapefile data processing
        this.processingFunctions.set('geojson', this.processGeoJSONData.bind(this));
        
        // Generic CSV processing
        this.processingFunctions.set('csv', this.processCSVData.bind(this));
    }

    /**
     * Load data with caching support
     */
    async loadData(datasetPath, options = {}) {
        const cacheKey = `${datasetPath}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey) && !options.forceRefresh) {
            console.log(`Loading ${datasetPath} from cache`);
            return this.cache.get(cacheKey);
        }

        try {
            console.log(`Loading ${datasetPath} from file`);
            const data = await this.fetchDataFromFile(datasetPath, options);
            
            // Cache the result
            this.cache.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error(`Error loading ${datasetPath}:`, error);
            throw new Error(`Failed to load dataset: ${datasetPath}`);
        }
    }

    /**
     * Fetch data from file based on file type
     */
    async fetchDataFromFile(datasetPath, options = {}) {
        const fileExtension = this.getFileExtension(datasetPath);
        
        switch (fileExtension) {
            case 'csv':
                return await this.loadCSVFile(datasetPath, options);
            case 'json':
                return await this.loadJSONFile(datasetPath, options);
            case 'xlsx':
            case 'xls':
                return await this.loadExcelFile(datasetPath, options);
            case 'geojson':
                return await this.loadGeoJSONFile(datasetPath, options);
            default:
                throw new Error(`Unsupported file type: ${fileExtension}`);
        }
    }

    /**
     * Load CSV file and parse it
     */
    async loadCSVFile(filePath, options = {}) {
        try {
            const response = await fetch(this.getFullPath(filePath));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            const data = this.parseCSV(csvText, options);
            
            // Apply processing function if specified
            const processingType = options.processingType || 'csv';
            if (this.processingFunctions.has(processingType)) {
                return this.processingFunctions.get(processingType)(data, options);
            }
            
            return data;
        } catch (error) {
            console.error(`Error loading CSV file ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Load JSON file
     */
    async loadJSONFile(filePath, options = {}) {
        try {
            const response = await fetch(this.getFullPath(filePath));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error loading JSON file ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Load Excel file (requires conversion to CSV first)
     */
    async loadExcelFile(filePath, options = {}) {
        // For Excel files, we'd need to convert them to CSV/JSON first
        // This would typically be done in the data preparation phase
        console.warn(`Excel file loading not implemented in browser. Convert ${filePath} to CSV first.`);
        throw new Error('Excel files must be converted to CSV format for web usage');
    }

    /**
     * Load GeoJSON file for geographic data
     */
    async loadGeoJSONFile(filePath, options = {}) {
        try {
            const response = await fetch(this.getFullPath(filePath));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const geoData = await response.json();
            
            // Apply GeoJSON processing
            if (this.processingFunctions.has('geojson')) {
                return this.processingFunctions.get('geojson')(geoData, options);
            }
            
            return geoData;
        } catch (error) {
            console.error(`Error loading GeoJSON file ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Parse CSV text into structured data
     */
    parseCSV(csvText, options = {}) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const delimiter = options.delimiter || this.detectDelimiter(lines[0]);
        const hasHeader = options.hasHeader !== false; // Default to true
        
        let headers = [];
        let startIndex = 0;

        if (hasHeader) {
            headers = this.parseLine(lines[0], delimiter);
            startIndex = 1;
        } else {
            // Generate generic headers
            const firstLine = this.parseLine(lines[0], delimiter);
            headers = firstLine.map((_, index) => `column_${index}`);
        }

        const data = [];
        for (let i = startIndex; i < lines.length; i++) {
            const values = this.parseLine(lines[i], delimiter);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = this.parseValue(values[index]);
                });
                data.push(row);
            }
        }

        return {
            headers,
            data,
            rowCount: data.length,
            columnCount: headers.length
        };
    }

    /**
     * Parse a single CSV line handling quotes and escapes
     */
    parseLine(line, delimiter = ',') {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result.map(value => value.trim());
    }

    /**
     * Parse individual values with type inference
     */
    parseValue(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        
        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '');
        
        // Try to parse as number
        const numValue = Number(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
            return numValue;
        }
        
        // Try to parse as boolean
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === 'false') {
            return lowerValue === 'true';
        }
        
        // Try to parse as date
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime()) && value.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/)) {
            return dateValue;
        }
        
        return value;
    }

    /**
     * Detect CSV delimiter
     */
    detectDelimiter(line) {
        const delimiters = [',', ';', '\t', '|'];
        let maxCount = 0;
        let bestDelimiter = ',';
        
        delimiters.forEach(delimiter => {
            const count = (line.split(delimiter).length - 1);
            if (count > maxCount) {
                maxCount = count;
                bestDelimiter = delimiter;
            }
        });
        
        return bestDelimiter;
    }

    /**
     * Process ACS (American Community Survey) data
     */
    processACSData(data, options = {}) {
        if (!data || !data.data) return data;

        // Extract geographic information
        const processedData = data.data.map(row => {
            const processed = { ...row };
            
            // Parse geographic identifiers
            if (row.GEO_ID) {
                processed.GEOID = this.extractGEOID(row.GEO_ID);
                processed.tractNumber = this.extractTractNumber(row.GEO_ID);
            }
            
            // Convert estimate and margin of error columns
            Object.keys(row).forEach(key => {
                if (key.includes('E') && !key.includes('NAME')) {
                    // Estimate column
                    const baseKey = key.replace('E', '');
                    processed[`${baseKey}_estimate`] = row[key];
                    
                    // Look for corresponding margin of error
                    const moeKey = key.replace('E', 'M');
                    if (row[moeKey]) {
                        processed[`${baseKey}_moe`] = row[moeKey];
                        processed[`${baseKey}_cv`] = this.calculateCoefficientOfVariation(row[key], row[moeKey]);
                    }
                }
            });
            
            return processed;
        });

        return {
            ...data,
            data: processedData,
            metadata: {
                ...data.metadata,
                survey: 'ACS 5-Year Estimates',
                processingDate: new Date().toISOString()
            }
        };
    }

    /**
     * Process Excel data (from converted CSV)
     */
    processExcelData(data, options = {}) {
        if (!data || !data.data) return data;

        // Clean up common Excel export artifacts
        const processedData = data.data.map(row => {
            const processed = {};
            
            Object.keys(row).forEach(key => {
                let cleanKey = key.trim();
                
                // Remove common Excel artifacts
                cleanKey = cleanKey.replace(/^\uFEFF/, ''); // BOM
                cleanKey = cleanKey.replace(/[^\w\s-_]/g, ''); // Special chars
                
                processed[cleanKey] = row[key];
            });
            
            return processed;
        });

        return {
            ...data,
            data: processedData
        };
    }

    /**
     * Process GeoJSON data
     */
    processGeoJSONData(geoData, options = {}) {
        // Ensure proper GeoJSON structure
        if (!geoData.type || !geoData.features) {
            throw new Error('Invalid GeoJSON format');
        }

        // Add computed properties
        geoData.features.forEach((feature, index) => {
            feature.properties = feature.properties || {};
            feature.properties.feature_id = index;
            
            // Calculate area if geometry is polygon
            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                feature.properties.computed_area = this.calculatePolygonArea(feature.geometry);
            }
        });

        return geoData;
    }

    /**
     * Process generic CSV data
     */
    processCSVData(data, options = {}) {
        if (!data || !data.data) return data;

        // Add row indices and basic cleaning
        const processedData = data.data.map((row, index) => ({
            ...row,
            row_index: index
        }));

        return {
            ...data,
            data: processedData
        };
    }

    /**
     * Utility: Extract GEOID from ACS GEO_ID
     */
    extractGEOID(geoId) {
        if (!geoId) return null;
        const match = geoId.match(/\d{11}$/); // Last 11 digits
        return match ? match[0] : null;
    }

    /**
     * Utility: Extract tract number from GEOID
     */
    extractTractNumber(geoId) {
        const geoid = this.extractGEOID(geoId);
        if (!geoid || geoid.length !== 11) return null;
        
        // Tract number is last 6 digits of GEOID
        return geoid.slice(-6);
    }

    /**
     * Utility: Calculate coefficient of variation
     */
    calculateCoefficientOfVariation(estimate, moe) {
        if (!estimate || !moe || estimate === 0) return null;
        return (moe / estimate) * 100;
    }

    /**
     * Utility: Calculate polygon area (simple approximation)
     */
    calculatePolygonArea(geometry) {
        // This is a simplified area calculation
        // For accurate calculations, use a proper GIS library
        if (geometry.type !== 'Polygon') return 0;
        
        const coords = geometry.coordinates[0];
        let area = 0;
        
        for (let i = 0; i < coords.length - 1; i++) {
            area += (coords[i][0] * coords[i + 1][1]) - (coords[i + 1][0] * coords[i][1]);
        }
        
        return Math.abs(area) / 2;
    }

    /**
     * Utility: Get file extension
     */
    getFileExtension(filePath) {
        return filePath.split('.').pop().toLowerCase();
    }

    /**
     * Utility: Get full file path
     */
    getFullPath(filePath) {
        return `${this.baseDataPath}${filePath}`;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Load multiple datasets concurrently
     */
    async loadMultipleDatasets(datasets) {
        const promises = datasets.map(dataset => {
            if (typeof dataset === 'string') {
                return this.loadData(dataset);
            } else {
                return this.loadData(dataset.path, dataset.options);
            }
        });

        try {
            const results = await Promise.all(promises);
            const datasetMap = {};
            
            datasets.forEach((dataset, index) => {
                const key = typeof dataset === 'string' ? dataset : dataset.name || dataset.path;
                datasetMap[key] = results[index];
            });
            
            return datasetMap;
        } catch (error) {
            console.error('Error loading multiple datasets:', error);
            throw error;
        }
    }

    /**
     * Filter data based on criteria
     */
    filterData(data, criteria) {
        if (!data || !data.data || !criteria) return data;

        const filteredData = data.data.filter(row => {
            return Object.keys(criteria).every(key => {
                const value = row[key];
                const criterion = criteria[key];
                
                if (typeof criterion === 'function') {
                    return criterion(value);
                } else if (Array.isArray(criterion)) {
                    return criterion.includes(value);
                } else {
                    return value === criterion;
                }
            });
        });

        return {
            ...data,
            data: filteredData,
            filteredRowCount: filteredData.length,
            originalRowCount: data.data.length
        };
    }

    /**
     * Aggregate data by specified columns
     */
    aggregateData(data, groupBy, aggregations) {
        if (!data || !data.data) return data;

        const groups = {};
        
        data.data.forEach(row => {
            const key = Array.isArray(groupBy) 
                ? groupBy.map(col => row[col]).join('|')
                : row[groupBy];
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
        });

        const aggregatedData = Object.keys(groups).map(key => {
            const group = groups[key];
            const result = {};
            
            // Add grouping columns
            if (Array.isArray(groupBy)) {
                groupBy.forEach((col, index) => {
                    result[col] = key.split('|')[index];
                });
            } else {
                result[groupBy] = key;
            }
            
            // Apply aggregations
            Object.keys(aggregations).forEach(column => {
                const aggType = aggregations[column];
                const values = group.map(row => row[column]).filter(v => v !== null && v !== undefined);
                
                switch (aggType) {
                    case 'sum':
                        result[`${column}_sum`] = values.reduce((a, b) => a + b, 0);
                        break;
                    case 'avg':
                        result[`${column}_avg`] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                        break;
                    case 'count':
                        result[`${column}_count`] = values.length;
                        break;
                    case 'min':
                        result[`${column}_min`] = values.length ? Math.min(...values) : null;
                        break;
                    case 'max':
                        result[`${column}_max`] = values.length ? Math.max(...values) : null;
                        break;
                }
            });
            
            return result;
        });

        return {
            ...data,
            data: aggregatedData,
            aggregatedFrom: data.data.length,
            aggregatedTo: aggregatedData.length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
} else {
    window.DataLoader = DataLoader;
} 