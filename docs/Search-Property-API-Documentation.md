# Property Search API Documentation

Base URL: `http://localhost:5000` (or `http://localhost:3000` when configured)

All endpoints return JSON. This API provides flexible property search with multi-field search (name, address, description, area, TP scheme, SIR status), property types, budget brackets, category filter chips, sorting, and pagination (default 20 items per page).

---

## Allowed Values & Filter Rules

### 1. Search Parameters (At least one parameter is used to filter properties)
- `search_city_locality` (or `locality`, `city`, `q`): Case-insensitive partial match across:
  - `property_name`
  - `property_address`
  - `property_description`
  - `property_area`
  - `property_tp`
  - `property_sir`
- `search_property_type` (or `property_type`, `propertyType`):
  - `Apartment / Flat`
  - `Residential Plot`
  - `Villa / House`
  - `Plot / Land`
  - `Commercial Space`
  - `Industrial Plot`
  - `Penthouse`
- `search_property_budget` (or `budget`, `property_budget`):
  - `Under ₹25L` (Properties up to ₹25 Lakhs)
  - `₹25L - ₹50L` (Properties between ₹25 Lakhs and ₹50 Lakhs)
  - `50L-1Cr` (Properties between ₹50 Lakhs and ₹1 Crore)
  - `1Cr-3Cr` (Properties between ₹1 Crore and ₹3 Crores)
  - `3Cr-5Cr` (Properties between ₹3 Crores and ₹5 Crores)
  - `Above 5Cr` / `Above 3Cr` (Properties above ₹3/₹5 Crores)

### 2. Category Filter Chips (`category` / `selectedChip`)
- `all`: All active properties
- `inside-sir`: Properties with SIR status containing `Inside`
- `tp-1`: Properties in TP Scheme 1 (`property_tp` contains `1`)
- `tp-2`: Properties in TP Scheme 2 (`property_tp` contains `2`)
- `plots`: Residential / commercial plots
- `commercial`: Commercial spaces and plazas
- `construction`: Properties under construction (`property_status` contains `construction`)

### 3. Listing Type Tabs (`search_listing_type` / `listing_type` / `type`)
- `buy`: Sale / purchase listings
- `rent`: Rental listings
- `projects`: Ongoing / new project developments

### 4. Sorting (`sortBy` / `sort_by`)
- `recommended`: Newest properties first (`created_at DESC`)
- `price-asc`: Price low to high (`property_min_price ASC`)
- `price-desc`: Price high to low (`property_max_price DESC`)

### 5. Pagination
- `currentPage` (or `page`): Positive integer starting at `1` (default: `1`)
- `itemsPerPage` (or `limit`): Items limit per page (default: `20`)

---

## Endpoints

### 1. GET Property Search

`GET /properties/search`

#### Query Parameters:
```
GET /properties/search?search_city_locality=TP1&search_property_type=Apartment%20/%20Flat&search_property_budget=25L-50L&currentPage=1&itemsPerPage=20
```

| Parameter Name | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search_city_locality` | `string` | Optional | City, area, TP, address or keyword | `"TP1"` |
| `search_property_type` | `string` | Optional | Property type dropdown value | `"Apartment / Flat"` |
| `search_property_budget` | `string` | Optional | Budget range selection | `"₹25L - ₹50L"` |
| `search_listing_type` | `string` | Optional | Listing tab (`buy`, `rent`, `projects`) | `"buy"` |
| `category` | `string` | Optional | Quick category filter chip | `"inside-sir"` |
| `property_tp` | `string` | Optional | Town Planning scheme (e.g. `TP1`) | `"TP1"` |
| `property_sir` | `string` | Optional | SIR status (`Inside` / `Outside`) | `"Inside"` |
| `sortBy` | `string` | Optional | Sort mode (`recommended`, `price-asc`, `price-desc`) | `"recommended"` |
| `currentPage` | `number` | Optional | Current page number (Default: `1`) | `1` |
| `itemsPerPage` | `number` | Optional | Page item limit (Default: `20`) | `20` |

#### Success Response (`200 OK` - Data Found):
```json
{
  "status": true,
  "message": "Properties retrieved successfully.",
  "data": [
    {
      "id": "1",
      "propertyName": "ABC Property Name",
      "propertyMinPrice": 2500000.00,
      "propertyMaxPrice": 3000000.00,
      "propertyAddress": "A-165",
      "propertyLattitude": null,
      "propertyLongitude": null,
      "propertyStatus": "CONSTRUCTION",
      "propertyDescription": "Premium residential plot in TP1 Inside SIR",
      "propertyArea": "150 sq yd",
      "propertyImage": "http://localhost:5000/assets/images/property_1_1789566155954.jpg",
      "propertyTP": "TP1",
      "propertySIR": "Inside",
      "propertyListingType": "SELL",
      "propertyBroucher": "http://localhost:5000/assets/pdf/brochure_1.pdf",
      "createdBy": "1",
      "createdAt": "2026-09-16T11:32:46.356Z",
      "updatedBy": null,
      "updatedAt": "2026-09-16T11:32:46.356Z",
      "isActive": true,
      "status": "ACTIVE",
      "images": [
        {
          "id": "1",
          "propertyId": "1",
          "imageUrl": "http://localhost:5000/assets/images/property_1_1789566155954.jpg",
          "createdBy": "1",
          "createdAt": "2026-09-16T11:32:46.356Z",
          "updatedBy": null,
          "updatedAt": null,
          "isActive": true,
          "status": "ACTIVE"
        }
      ]
    }
  ],
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1,
  "itemsPerPage": 20
}
```

#### Success Response (`200 OK` - Data Not Found):
```json
{
  "status": true,
  "message": "Data not found",
  "data": [],
  "totalItems": 0,
  "totalPages": 0,
  "currentPage": 1,
  "itemsPerPage": 20
}
```

---

### 2. POST Property Search

`POST /properties/search`

`Content-Type: application/json`

#### Request Body:
```json
{
  "search_city_locality": "TP1",
  "search_property_type": "Apartment / Flat",
  "search_property_budget": "50L-1Cr",
  "search_listing_type": "buy",
  "category": "inside-sir",
  "sortBy": "price-asc",
  "currentPage": "1",
  "itemsPerPage": "20"
}
```

#### Success Response (`200 OK`):
```json
{
  "status": true,
  "message": "Properties retrieved successfully.",
  "data": [
    {
      "id": "2",
      "propertyName": "Abhay Pipal",
      "propertyMinPrice": 233.00,
      "propertyMaxPrice": 2332.00,
      "propertyAddress": "sdsd",
      "propertyLattitude": null,
      "propertyLongitude": null,
      "propertyStatus": "Under Construction",
      "propertyDescription": "Modern residential project",
      "propertyArea": "120 sq yd",
      "propertyImage": "http://localhost:5000/assets/images/71SiLxdQ0jL__AC_UF1000_1000_QL80__1789566155954_1558.jpg",
      "propertyTP": "1",
      "propertySIR": "Inside",
      "propertyListingType": "RENT",
      "propertyBroucher": null,
      "createdBy": "1",
      "createdAt": "2026-09-17T08:15:20.123Z",
      "updatedBy": null,
      "updatedAt": null,
      "isActive": true,
      "status": "ACTIVE",
      "images": []
    }
  ],
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1,
  "itemsPerPage": 20
}
```

---

## 3. Database Table References

### `dhulera_properties`
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigserial` | Primary Key |
| `property_name` | `varchar(255)` | Name/Title of the property |
| `property_min_price` | `numeric(14, 2)` | Starting minimum price (₹) |
| `property_max_price` | `numeric(14, 2)` | Maximum price range (₹) |
| `property_address` | `text` | Location address or plot number tag (e.g. A-165) |
| `property_status` | `varchar(50)` | Status (e.g. "CONSTRUCTION", "Under Construction", "AVAILABLE") |
| `property_description` | `text` | Detailed property description |
| `property_area` | `varchar(100)` | Area specification (e.g. "150 sq yd") |
| `property_image` | `text` | Primary featured image URL/path |
| `property_tp` | `varchar(100)` | Town Planning Scheme (e.g. "TP1", "TP2", "1") |
| `property_sir` | `varchar(100)` | SIR classification (e.g. "Inside", "Outside") |
| `property_listing_type` | `varchar(100)` | Listing category (e.g. "SELL", "RENT", "PROJECT") |
| `property_broucher` | `text` | URL/path to brochure PDF |
| `is_active` | `bool` | Active state flag (`true` / `false`) |
| `status` | `enum` | Status enum (`ACTIVE`, `INACTIVE`, `DELETED`) |

### `dhulera_properties_images`
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigserial` | Primary Key |
| `property_id` | `int8` | Foreign Key referencing `dhulera_properties.id` |
| `image_url` | `varchar(500)` | Relative or absolute image file path |
| `is_active` | `bool` | Active state flag |
| `status` | `enum` | Status enum (`ACTIVE`, `INACTIVE`, `DELETED`) |

---

## 4. Frontend Integration Reference

The frontend search form connects to the search API using:
- **Search City/Locality**: Input element `name="search_city_locality"`
- **Property Type**: Select element `name="search_property_type"`
- **Budget**: Select element `name="search_property_budget"`
- **Submit Button**: Button element `name="search_submit"`
- **Pagination**: 20 items per page with automatic scroll loading (`IntersectionObserver`).
