# API Timeout Issue - Clear All Filters 🔧

## Issue
When clicking "Clear all filters", the app shows a loader indefinitely and then displays a timeout error.

## Error Details

```
API Error: timeout of 30000ms exceeded
Code: ECONNABORTED
URL: /advertisements/browse?latitude=51.4491363&longitude=-0.0742556&radius=50&sort=created_at&order=DESC&page=1&limit=20
Base URL: https://api.roundbuy.com/backend/api/v1/mobile-app
```

## Root Cause

The backend API is taking more than 30 seconds to respond, causing a timeout error.

### Possible Reasons:

1. **Backend Performance**
   - Database query is slow
   - No indexes on lat/long columns
   - Too many records to process
   - Server overloaded

2. **Network Issues**
   - Slow internet connection
   - Server far from user location
   - Network congestion

3. **Query Complexity**
   - Radius search on large dataset
   - No spatial indexes
   - Inefficient SQL query

## Current Behavior

```
User clicks "Clear all"
  ↓
All filters cleared
  ↓
API request sent
  ↓
Wait 30 seconds...
  ↓
❌ Timeout error
  ↓
Alert shown
  ↓
Loader keeps spinning
```

## Recommended Solutions

### Solution 1: Backend Optimization (BEST)

**Add spatial indexes to database:**

```sql
-- Add spatial index for lat/long searches
CREATE INDEX idx_advertisements_location 
ON advertisements (latitude, longitude);

-- Or use PostGIS for better performance
CREATE INDEX idx_advertisements_geom 
ON advertisements USING GIST (geom);
```

**Optimize query:**
```sql
-- Use spatial query instead of calculating distance for each row
SELECT * FROM advertisements
WHERE ST_DWithin(
  geom,
  ST_MakePoint(longitude, latitude),
  radius_in_meters
)
ORDER BY created_at DESC
LIMIT 20;
```

### Solution 2: Increase Timeout (TEMPORARY)

**In api.config.js:**
```javascript
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 60000, // Increase to 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});
```

❌ Not recommended - doesn't fix root cause
✅ Can be used temporarily while fixing backend

### Solution 3: Better Error Handling (IMMEDIATE)

**Update SearchScreen error handling:**

```javascript
} catch (err) {
  console.error('Error fetching advertisements:', err);
  setError(err.message || 'Failed to load advertisements');

  if (err.require_subscription) {
    // ... subscription alert
  } else if (err.require_login) {
    // ... login alert
  } else if (err.error_code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED') {
    // Handle timeout specifically
    Alert.alert(
      'Connection Timeout',
      'The server is taking too long to respond. Please try again or check your internet connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => fetchAdvertisements(false) }
      ]
    );
  } else {
    Alert.alert(
      'Error',
      err.message || 'Failed to load advertisements.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => fetchAdvertisements(false) }
      ]
    );
  }
} finally {
  setLoading(false);  // ← Make sure this always runs
  setRefreshing(false);
}
```

### Solution 4: Add Loading State Management

**Ensure loading stops on error:**

```javascript
} finally {
  setLoading(false);
  setRefreshing(false);
}
```

This ensures the loader stops even if there's an error.

### Solution 5: Pagination & Caching

**Load data in smaller chunks:**

```javascript
const searchFilters = {
  // ...
  page: 1,
  limit: 10, // Reduce from 20 to 10
};
```

**Cache results:**
```javascript
const [cachedAds, setCachedAds] = useState({});

// Check cache first
const cacheKey = JSON.stringify(searchFilters);
if (cachedAds[cacheKey]) {
  setAdvertisements(cachedAds[cacheKey]);
  return;
}
```

## Immediate Fix

### Step 1: Check Backend Logs

Look for slow queries:
```bash
# Check PostgreSQL slow query log
tail -f /var/log/postgresql/postgresql-slow.log

# Or check application logs
tail -f /var/log/roundbuy/backend.log
```

### Step 2: Test API Directly

```bash
curl -X GET \
  "https://api.roundbuy.com/backend/api/v1/mobile-app/advertisements/browse?latitude=51.4491363&longitude=-0.0742556&radius=50&sort=created_at&order=DESC&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -w "\nTime: %{time_total}s\n"
```

Check how long it takes.

### Step 3: Reduce Radius Temporarily

**In CombinedFiltersModal.js:**
```javascript
const handleClearAll = () => {
  // ...
  onUpdateFilters({
    // ...
    radius: 10, // Reduce from 50 to 10 temporarily
  });
};
```

Smaller radius = fewer results = faster query

## Long-term Solution

### Backend Changes:

1. **Add spatial indexes**
   ```sql
   CREATE INDEX idx_ads_location ON advertisements (latitude, longitude);
   ```

2. **Use PostGIS**
   ```sql
   ALTER TABLE advertisements ADD COLUMN geom geometry(Point, 4326);
   UPDATE advertisements SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
   CREATE INDEX idx_ads_geom ON advertisements USING GIST (geom);
   ```

3. **Optimize query**
   - Use spatial functions
   - Add proper WHERE clauses
   - Limit results early

4. **Add caching**
   - Redis cache for common queries
   - Cache results for 5 minutes

### Frontend Changes:

1. **Better error handling** (as shown above)
2. **Retry mechanism**
3. **Loading state management**
4. **Offline support**

## Testing

### Test 1: Direct API Call
```bash
time curl "https://api.roundbuy.com/backend/api/v1/mobile-app/advertisements/browse?latitude=51.4491363&longitude=-0.0742556&radius=50&sort=created_at&order=DESC&page=1&limit=20"
```

Expected: < 2 seconds
Actual: > 30 seconds ❌

### Test 2: Smaller Radius
```bash
# Try with radius=5
time curl "...&radius=5..."
```

If this is fast, it confirms the issue is with large radius searches.

### Test 3: Database Query
```sql
EXPLAIN ANALYZE
SELECT * FROM advertisements
WHERE /* your query */;
```

Look for "Seq Scan" - this means no index is being used.

## Summary

**Problem:** API timeout when clearing filters (30+ seconds)

**Root Cause:** Backend database query is slow, likely due to:
- No spatial indexes
- Inefficient radius search
- Large dataset

**Immediate Fix:**
1. ✅ Better error handling with retry
2. ✅ Ensure loader stops on error
3. ⚠️ Reduce default radius temporarily

**Long-term Fix:**
1. 🔧 Add spatial indexes to database
2. 🔧 Optimize backend query
3. 🔧 Add caching layer
4. 🔧 Use PostGIS for spatial queries

**Next Steps:**
1. Check backend logs for slow queries
2. Test API directly to measure response time
3. Add spatial indexes to database
4. Optimize the browse advertisements query

The frontend is working correctly - the issue is backend performance! 🔧
