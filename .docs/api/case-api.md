# CASE API

> Generated from: https://api.alpha-1edtech.com/case/openapi.yaml
> Generated on: 2025-09-18T03:08:06.186Z

---

# CASE API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

Timeback Platform's implementation of the 1EdTech CASE API (Competencies and Academic Standards Exchange) - <https://www.1edtech.org/standards/case>

# Authentication

All endpoints require authentication using the `Authorization: Bearer <token>` header.

The token can be obtained with:

```curl
curl -X POST https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com/oauth2/token \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "grant_type=client_credentials&client_id=<your-client-id>&client_secret=<your-client-secret>"
```

Use the correct IDP server depending on the environment you're using:

- Production Server: <https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com>
- Staging Server: <https://alpha-auth-development-idp.auth.us-west-2.amazoncognito.com>

Reach out to the platform team to get a client/secret pair for your application.

# Pagination

Our API uses offset pagination for list endpoints. Paginated responses include the following fields:

- `offset`: Offset for the next page of results
- `limit`: Number of items per page (default: 100, maximum: 3000)

**Note:** While the OneRoster specification does not define a maximum limit, this implementation enforces a maximum of 3000 items per page to prevent abuse and ensure optimal performance.

Example request:

```bash
GET /ims/oneroster/rostering/v1p2/users?offset=20&limit=20
```

All listing endpoints support offset pagination.

# Filtering

All listing endpoints support filtering using the `filter` query parameter, following 1EdTech's filtering specification.

The filter should be a string with the following format:

```css
?filter=[field][operator][value]
```

Example request:

```bash
GET /ims/oneroster/rostering/v1p2/users?filter=status='active'
```

Example request with multiple filters:

```bash
GET /ims/oneroster/rostering/v1p2/users?filter=status='active' AND name='John'
```

**Filtering by nested relations is not supported**.

# Sorting

All listing endpoints support sorting using the `sort` and `orderBy` query parameters, following 1EdTech's sorting specification

Example request:

```bash
GET /ims/oneroster/rostering/v1p2/users?sort=lastName&orderBy=asc
```

# Proprietary Extensions

This implementation includes proprietary extensions that extend beyond the official OneRoster 1.2 specification to provide additional functionality.

## Search Parameter

In addition to the standard `filter` parameter, this implementation provides a `search` query parameter for simplified free-text searching:

```bash
GET /ims/oneroster/rostering/v1p2/users?search=john
```

**Purpose**: The `search` parameter enables convenient text-based queries across multiple fields simultaneously, whereas the standard `filter` parameter requires specifying exact field names and operators:

```sql
# Search parameter - searches across multiple fields automatically
GET /ims/oneroster/rostering/v1p2/users?search=john

# Equivalent using standard filter parameter
GET /ims/oneroster/rostering/v1p2/users?filter=givenName~'john' OR familyName~'john'
```

The `search` parameter performs case-insensitive partial matching across predefined fields for each endpoint, providing a more user-friendly querying experience.

## OneRoster 1.2 Standard Parameters

The official OneRoster 1.2 specification defines these standard parameters:

- `limit` - pagination limit
- `offset` - pagination offset
- `sort` - field to sort by
- `orderBy` - sort direction (asc/desc)
- `filter` - filtering expression
- `fields` - field selection

## Affected Endpoints

The proprietary `search` parameter is available on the following endpoints:

**Rostering API**:

- `GET /ims/oneroster/rostering/v1p2/academicSessions/`
- `GET /ims/oneroster/rostering/v1p2/classes/`
- `GET /ims/oneroster/rostering/v1p2/classes/{classSourcedId}/students`
- `GET /ims/oneroster/rostering/v1p2/classes/{classSourcedId}/teachers`
- `GET /ims/oneroster/rostering/v1p2/courses/`
- `GET /ims/oneroster/rostering/v1p2/courses/{courseSourcedId}/classes`
- `GET /ims/oneroster/rostering/v1p2/demographics/`
- `GET /ims/oneroster/rostering/v1p2/enrollments/`
- `GET /ims/oneroster/rostering/v1p2/schools/{schoolSourcedId}/classes/{classSourcedId}/students`
- `GET /ims/oneroster/rostering/v1p2/users/`

**Gradebook API**:

- `GET /ims/oneroster/gradebook/v1p2/assessmentLineItems/`
- `GET /ims/oneroster/gradebook/v1p2/assessmentResults/`
- `GET /ims/oneroster/gradebook/v1p2/classes/{classSourcedId}/students/{studentSourcedId}/results`
- `GET /ims/oneroster/gradebook/v1p2/results/`

**Resources API**:

- `GET /ims/oneroster/resources/v1p2/resources/`

## Parameter Usage Guide

### Filter Parameter

The standard `filter` parameter provides precise control over queries using these operators:

- `=` - Exact match
- `!=` - Not equal
- `~` - Contains (case-insensitive)
- `>`, `>=`, `<`, `<=` - Comparison operators
- `@` - In list (comma-separated values)

### Logical Operators

Combine multiple conditions in filter expressions:

- `AND` - Both conditions must be true
- `OR` - Either condition must be true

### Usage Examples

```bash
# Simple text search across multiple fields
GET /users?search=john

# Equivalent precise filtering
GET /users?filter=givenName~'john' OR familyName~'john'

# Complex filtering with multiple conditions
GET /users?filter=status='active' AND givenName~'john'

# Advanced filtering with different operators
GET /users?filter=dateLastModified>'2023-01-01' AND status='active'
```

## Search Fields by Endpoint

Different endpoints search across these predefined fields:

- **Users**: `givenName`, `familyName`, `email`
- **Courses**: `title`, `courseCode`
- **Classes**: `title`
- **Organizations**: `name`

## Interoperability Notes

The `search` parameter is a proprietary extension specific to this implementation. Other OneRoster-compliant systems may only support the standard `filter` parameter. When building applications that need to work with multiple OneRoster providers, consider using the standard filtering approach.

## Additional Schema Fields

### AssessmentLineItem Extensions

The AssessmentLineItem schema includes two proprietary fields that extend curriculum mapping capabilities:

#### Component Field

- **Field**: `component`
- **Type**: Object reference (`{ sourcedId: string }`)
- **Purpose**: Direct association between assessment line items and course components, enabling enhanced curriculum mapping and learning pathway tracking.

#### ComponentResource Field

- **Field**: `componentResource`
- **Type**: Object reference (`{ sourcedId: string }`)
- **Purpose**: Direct association between assessment line items and specific learning resources, supporting detailed content-to-assessment relationships and adaptive learning features.

**Example Usage**:

```json
{
  "sourcedId": "assessment-123",
  "title": "Chapter 5 Quiz",
  "component": { "sourcedId": "component-456" },
  "componentResource": { "sourcedId": "resource-789" }
}
```

## Affected Endpoints

### Schema Extensions Availability

The proprietary schema fields are available in:

**Gradebook API**:

- `GET /ims/oneroster/gradebook/v1p2/assessmentLineItems/` - Returns assessmentLineItems with `component` and `componentResource` fields
- `GET /ims/oneroster/gradebook/v1p2/assessmentLineItems/{sourcedId}` - Returns individual assessmentLineItem with extended fields
- `POST /ims/oneroster/gradebook/v1p2/assessmentLineItems/` - Accepts `component` and `componentResource` in request body
- `PUT /ims/oneroster/gradebook/v1p2/assessmentLineItems/{sourcedId}` - Accepts extended fields for updates

## Servers

- **URL:** `https://api.alpha-1edtech.com`
  - **Description:** CASE API

## Operations

### Get CASE Association by ID

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFAssociations/{sourcedId}`
- **Tags:** CASE - Learning Standards

Returns a specific CASE Association identified by its sourcedId

#### Responses

##### Status: 200 CASE Association

###### Content-Type: application/json

- **`CFAssociation` (required)**

  `object` — Represents a relationship between framework items.

  - **`associationType` (required)**

    `string`

  - **`destinationNodeURI` (required)**

    `object`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`lastChangeDateTime` (required)**

    `string`, format: `date-time`

  - **`originNodeURI` (required)**

    `object`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`uri` (required)**

    `string`, format: `uri`

  - **`CFAssociationGroupingURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`CFDocumentURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`extensions`**

    `object | null`

  - **`notes`**

    `string | null`

  - **`sequenceNumber`**

    `integer | null`

**Example:**

```
{
  "CFAssociation": {
    "sourcedId": "",
    "associationType": "",
    "sequenceNumber": null,
    "uri": "",
    "originNodeURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "destinationNodeURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "CFAssociationGroupingURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "lastChangeDateTime": "",
    "notes": null,
    "extensions": null,
    "CFDocumentURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    }
  }
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Get All CASE Documents

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFDocuments`
- **Tags:** CASE - Learning Standards

Returns a collection of all CASE documents in the system

#### Responses

##### Status: 200 Collection of CASE Documents

###### Content-Type: application/json

- **`CFDocuments` (required)**

  `array`

  **Items:**

  - **`CFPackageURI` (required)**

    `object`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`creator` (required)**

    `string`

  - **`lastChangeDateTime` (required)**

    `string`, format: `date-time`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`title` (required)**

    `string`

  - **`uri` (required)**

    `string`, format: `uri`

  - **`adoptionStatus`**

    `string | null`

  - **`caseVersion`**

    `string | null`, possible values: `"1.1", null`

  - **`description`**

    `string | null`

  - **`extensions`**

    `object | null`

  - **`frameworkType`**

    `string | null`

  - **`language`**

    `string | null`

  - **`licenseURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`notes`**

    `string | null`

  - **`officialSourceURL`**

    `string | null`, format: `uri`

  - **`publisher`**

    `string | null`

  - **`statusEndDate`**

    `string | null`, format: `date`

  - **`statusStartDate`**

    `string | null`, format: `date`

  - **`subject`**

    `array | null`

  - **`subjectURI`**

    `array | null`

  - **`version`**

    `string | null`

**Example:**

```
{
  "CFDocuments": [
    {
      "sourcedId": "",
      "title": "",
      "uri": "",
      "frameworkType": null,
      "caseVersion": "1.1",
      "creator": "",
      "lastChangeDateTime": "",
      "officialSourceURL": null,
      "publisher": null,
      "description": null,
      "subject": [
        ""
      ],
      "subjectURI": [
        {
          "sourcedId": "",
          "title": "",
          "uri": ""
        }
      ],
      "language": null,
      "version": null,
      "adoptionStatus": null,
      "statusStartDate": null,
      "statusEndDate": null,
      "licenseURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      },
      "notes": null,
      "extensions": null,
      "CFPackageURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      }
    }
  ]
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Get CASE Document by ID

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFDocuments/{sourcedId}`
- **Tags:** CASE - Learning Standards

Returns a specific CASE Document identified by its sourcedId

#### Responses

##### Status: 200 CASE Document

###### Content-Type: application/json

- **`CFDocument` (required)**

  `object` — Represents a Competency Framework Document.

  - **`CFPackageURI` (required)**

    `object`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`creator` (required)**

    `string`

  - **`lastChangeDateTime` (required)**

    `string`, format: `date-time`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`title` (required)**

    `string`

  - **`uri` (required)**

    `string`, format: `uri`

  - **`adoptionStatus`**

    `string | null`

  - **`caseVersion`**

    `string | null`, possible values: `"1.1", null`

  - **`description`**

    `string | null`

  - **`extensions`**

    `object | null`

  - **`frameworkType`**

    `string | null`

  - **`language`**

    `string | null`

  - **`licenseURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`notes`**

    `string | null`

  - **`officialSourceURL`**

    `string | null`, format: `uri`

  - **`publisher`**

    `string | null`

  - **`statusEndDate`**

    `string | null`, format: `date`

  - **`statusStartDate`**

    `string | null`, format: `date`

  - **`subject`**

    `array | null`

  - **`subjectURI`**

    `array | null`

  - **`version`**

    `string | null`

**Example:**

```
{
  "CFDocument": {
    "sourcedId": "",
    "title": "",
    "uri": "",
    "frameworkType": null,
    "caseVersion": "1.1",
    "creator": "",
    "lastChangeDateTime": "",
    "officialSourceURL": null,
    "publisher": null,
    "description": null,
    "subject": [
      ""
    ],
    "subjectURI": [
      {
        "sourcedId": "",
        "title": "",
        "uri": ""
      }
    ],
    "language": null,
    "version": null,
    "adoptionStatus": null,
    "statusStartDate": null,
    "statusEndDate": null,
    "licenseURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "notes": null,
    "extensions": null,
    "CFPackageURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    }
  }
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Get All CASE Items

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFItems`
- **Tags:** CASE - Learning Standards

Returns a collection of all CASE Items

#### Responses

##### Status: 200 Collection of CASE Items

###### Content-Type: application/json

- **`CFItems` (required)**

  `array`

  **Items:**

  - **`CFItemType` (required)**

    `string`

  - **`fullStatement` (required)**

    `string`

  - **`lastChangeDateTime` (required)**

    `string`, format: `date-time`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`uri` (required)**

    `string`, format: `uri`

  - **`abbreviatedStatement`**

    `string | null`

  - **`alternativeLabel`**

    `string | null`

  - **`CFDocumentURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`CFItemTypeURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`conceptKeywords`**

    `array | null`

  - **`conceptKeywordsURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`educationLevel`**

    `array | null`

  - **`extensions`**

    `object | null`

  - **`humanCodingScheme`**

    `string | null`

  - **`language`**

    `string | null`

  - **`licenseURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`listEnumeration`**

    `string | null`

  - **`notes`**

    `string | null`

  - **`statusEndDate`**

    `string | null`, format: `date`

  - **`statusStartDate`**

    `string | null`, format: `date`

  - **`subject`**

    `array | null`

  - **`subjectURI`**

    `array | null`

**Example:**

```
{
  "CFItems": [
    {
      "sourcedId": "",
      "fullStatement": "",
      "alternativeLabel": null,
      "CFItemType": "",
      "uri": "",
      "humanCodingScheme": null,
      "listEnumeration": null,
      "abbreviatedStatement": null,
      "conceptKeywords": [
        ""
      ],
      "conceptKeywordsURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      },
      "notes": null,
      "subject": [
        ""
      ],
      "subjectURI": [
        {
          "sourcedId": "",
          "title": "",
          "uri": ""
        }
      ],
      "language": null,
      "educationLevel": [
        ""
      ],
      "CFItemTypeURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      },
      "licenseURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      },
      "statusStartDate": null,
      "statusEndDate": null,
      "lastChangeDateTime": "",
      "extensions": null,
      "CFDocumentURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      }
    }
  ]
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Get CASE Item by ID

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFItems/{sourcedId}`
- **Tags:** CASE - Learning Standards

Returns a specific CASE Item identified by its sourcedId

#### Responses

##### Status: 200 CASE Item

###### Content-Type: application/json

- **`CFItem` (required)**

  `object` — Represents an item in a competency framework.

  - **`CFItemType` (required)**

    `string`

  - **`fullStatement` (required)**

    `string`

  - **`lastChangeDateTime` (required)**

    `string`, format: `date-time`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`uri` (required)**

    `string`, format: `uri`

  - **`abbreviatedStatement`**

    `string | null`

  - **`alternativeLabel`**

    `string | null`

  - **`CFDocumentURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`CFItemTypeURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`conceptKeywords`**

    `array | null`

  - **`conceptKeywordsURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`educationLevel`**

    `array | null`

  - **`extensions`**

    `object | null`

  - **`humanCodingScheme`**

    `string | null`

  - **`language`**

    `string | null`

  - **`licenseURI`**

    `object | null`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

  - **`listEnumeration`**

    `string | null`

  - **`notes`**

    `string | null`

  - **`statusEndDate`**

    `string | null`, format: `date`

  - **`statusStartDate`**

    `string | null`, format: `date`

  - **`subject`**

    `array | null`

  - **`subjectURI`**

    `array | null`

**Example:**

```
{
  "CFItem": {
    "sourcedId": "",
    "fullStatement": "",
    "alternativeLabel": null,
    "CFItemType": "",
    "uri": "",
    "humanCodingScheme": null,
    "listEnumeration": null,
    "abbreviatedStatement": null,
    "conceptKeywords": [
      ""
    ],
    "conceptKeywordsURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "notes": null,
    "subject": [
      ""
    ],
    "subjectURI": [
      {
        "sourcedId": "",
        "title": "",
        "uri": ""
      }
    ],
    "language": null,
    "educationLevel": [
      ""
    ],
    "CFItemTypeURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "licenseURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    },
    "statusStartDate": null,
    "statusEndDate": null,
    "lastChangeDateTime": "",
    "extensions": null,
    "CFDocumentURI": {
      "sourcedId": "",
      "title": "",
      "uri": ""
    }
  }
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Upload CASE Package

- **Method:** `POST`
- **Path:** `/ims/case/v1p1/CFPackages`
- **Tags:** CASE - Learning Standards

Upload a complete CASE package with document, items, and associations

#### Request Body

##### Content-Type: application/json

- **`CFAssociations` (required)**

  `array`

  **Items:**

  - **`associationType` (required)**

    `string`

  - **`destinationNodeURI` (required)**

    `object`

    - **`identifier` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`

  - **`identifier` (required)**

    `string`, format: `uuid`

  - **`lastChangeDateTime` (required)**

    `string`

  - **`originNodeURI` (required)**

    `object`

    - **`identifier` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`

  - **`uri` (required)**

    `string`

  - **`extensions`**

    `object`

  - **`sequenceNumber`**

    `number`

- **`CFDocument` (required)**

  `object`

  - **`creator` (required)**

    `string`

  - **`identifier` (required)**

    `string`, format: `uuid`

  - **`lastChangeDateTime` (required)**

    `string`

  - **`title` (required)**

    `string`

  - **`uri` (required)**

    `string`

  - **`adoptionStatus`**

    `string`

  - **`caseVersion`**

    `string`

  - **`description`**

    `string`

  - **`language`**

    `string`

  - **`licenseUri`**

    `string`

  - **`notes`**

    `string`

  - **`officialSourceURL`**

    `string`

  - **`publisher`**

    `string`

  - **`statusEndDate`**

    `string`

  - **`statusStartDate`**

    `string`

  - **`subject`**

    `array`

    **Items:**

    `string`

  - **`version`**

    `string`

- **`CFItems` (required)**

  `array`

  **Items:**

  - **`fullStatement` (required)**

    `string`

  - **`identifier` (required)**

    `string`, format: `uuid`

  - **`lastChangeDateTime` (required)**

    `string`

  - **`uri` (required)**

    `string`

  - **`abbreviatedStatement`**

    `string`

  - **`alternativeLabel`**

    `string`

  - **`cfItemType`**

    `string`

  - **`CFItemType`**

    `string`

  - **`CFItemTypeURI`**

    `object`

  - **`conceptKeywords`**

    `array`

    **Items:**

    `string`

  - **`educationLevel`**

    `array`

    **Items:**

    `string`

  - **`extensions`**

    `object`

  - **`humanCodingScheme`**

    `string`

  - **`language`**

    `string`

  - **`licenseURI`**

    `object`

  - **`listEnumeration`**

    `string`

  - **`notes`**

    `string`

  - **`statusEndDate`**

    `string`

  - **`statusStartDate`**

    `string`

  - **`subject`**

    `array`

    **Items:**

    `string`

- **`CFDefinitions`**

  `object`

  - **`CFAssociationGroupings`**

    `array`

    **Items:**

  - **`CFConcepts`**

    `array`

    **Items:**

  - **`CFItemTypes`**

    `array`

    **Items:**

  - **`CFLicenses`**

    `array`

    **Items:**

  - **`CFSubjects`**

    `array`

    **Items:**

  - **`extensions`**

    `object`

- **`extensions`**

  `object`

**Example:**

```
{
  "CFDocument": {
    "identifier": "",
    "uri": "",
    "lastChangeDateTime": "",
    "title": "",
    "creator": "",
    "officialSourceURL": "",
    "publisher": "",
    "description": "",
    "language": "",
    "version": "",
    "caseVersion": "",
    "adoptionStatus": "",
    "statusStartDate": "",
    "statusEndDate": "",
    "licenseUri": "",
    "notes": "",
    "subject": [
      ""
    ]
  },
  "CFItems": [
    {
      "identifier": "",
      "uri": "",
      "lastChangeDateTime": "",
      "fullStatement": "",
      "alternativeLabel": "",
      "CFItemType": "",
      "cfItemType": "",
      "humanCodingScheme": "",
      "listEnumeration": "",
      "abbreviatedStatement": "",
      "conceptKeywords": [
        ""
      ],
      "notes": "",
      "subject": [
        ""
      ],
      "language": "",
      "educationLevel": [
        ""
      ],
      "CFItemTypeURI": null,
      "licenseURI": null,
      "statusStartDate": "",
      "statusEndDate": "",
      "extensions": null
    }
  ],
  "CFAssociations": [
    {
      "identifier": "",
      "uri": "",
      "lastChangeDateTime": "",
      "associationType": "",
      "originNodeURI": {
        "title": "",
        "identifier": "",
        "uri": ""
      },
      "destinationNodeURI": {
        "title": "",
        "identifier": "",
        "uri": ""
      },
      "sequenceNumber": 1,
      "extensions": null
    }
  ],
  "CFDefinitions": {
    "CFItemTypes": [],
    "CFSubjects": [],
    "CFConcepts": [],
    "CFLicenses": [],
    "CFAssociationGroupings": [],
    "extensions": null
  },
  "extensions": null
}
```

#### Responses

##### Status: 201 CASE Package Upload Result

###### Content-Type: application/json

- **`message` (required)**

  `string`

- **`result` (required)**

  `object`

  - **`documentId` (required)**

    `string`

  - **`stats` (required)**

    `object`

    - **`associations` (required)**

      `number`

    - **`documents` (required)**

      `number`

    - **`items` (required)**

      `number`

  - **`success` (required)**

    `boolean`

- **`success` (required)**

  `boolean`

**Example:**

```
{
  "success": true,
  "message": "",
  "result": {
    "documentId": "",
    "stats": {
      "documents": 1,
      "items": 1,
      "associations": 1
    },
    "success": true
  }
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Get CASE Package by ID

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFPackages/{sourcedId}`
- **Tags:** CASE - Learning Standards

Returns a complete CASE package for the specified sourcedId

#### Responses

##### Status: 200 CASE Package

###### Content-Type: application/json

- **`CFPackage` (required)**

  `object` — Represents a complete competency framework package.

  - **`CFDocument` (required)**

    `object` — Represents a Competency Framework Document.

    - **`CFPackageURI` (required)**

      `object`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`creator` (required)**

      `string`

    - **`lastChangeDateTime` (required)**

      `string`, format: `date-time`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

    - **`adoptionStatus`**

      `string | null`

    - **`caseVersion`**

      `string | null`, possible values: `"1.1", null`

    - **`description`**

      `string | null`

    - **`extensions`**

      `object | null`

    - **`frameworkType`**

      `string | null`

    - **`language`**

      `string | null`

    - **`licenseURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`notes`**

      `string | null`

    - **`officialSourceURL`**

      `string | null`, format: `uri`

    - **`publisher`**

      `string | null`

    - **`statusEndDate`**

      `string | null`, format: `date`

    - **`statusStartDate`**

      `string | null`, format: `date`

    - **`subject`**

      `array | null`

    - **`subjectURI`**

      `array | null`

    - **`version`**

      `string | null`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`CFAssociations`**

    `array`

    **Items:**

    - **`associationType` (required)**

      `string`

    - **`destinationNodeURI` (required)**

      `object`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`lastChangeDateTime` (required)**

      `string`, format: `date-time`

    - **`originNodeURI` (required)**

      `object`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`uri` (required)**

      `string`, format: `uri`

    - **`CFAssociationGroupingURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`CFDocumentURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`extensions`**

      `object | null`

    - **`notes`**

      `string | null`

    - **`sequenceNumber`**

      `integer | null`

  - **`CFItems`**

    `array`

    **Items:**

    - **`CFItemType` (required)**

      `string`

    - **`fullStatement` (required)**

      `string`

    - **`lastChangeDateTime` (required)**

      `string`, format: `date-time`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`uri` (required)**

      `string`, format: `uri`

    - **`abbreviatedStatement`**

      `string | null`

    - **`alternativeLabel`**

      `string | null`

    - **`CFDocumentURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`CFItemTypeURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`conceptKeywords`**

      `array | null`

    - **`conceptKeywordsURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`educationLevel`**

      `array | null`

    - **`extensions`**

      `object | null`

    - **`humanCodingScheme`**

      `string | null`

    - **`language`**

      `string | null`

    - **`licenseURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`listEnumeration`**

      `string | null`

    - **`notes`**

      `string | null`

    - **`statusEndDate`**

      `string | null`, format: `date`

    - **`statusStartDate`**

      `string | null`, format: `date`

    - **`subject`**

      `array | null`

    - **`subjectURI`**

      `array | null`

**Example:**

```
{
  "CFPackage": {
    "sourcedId": "",
    "CFDocument": {
      "sourcedId": "",
      "title": "",
      "uri": "",
      "frameworkType": null,
      "caseVersion": "1.1",
      "creator": "",
      "lastChangeDateTime": "",
      "officialSourceURL": null,
      "publisher": null,
      "description": null,
      "subject": [
        ""
      ],
      "subjectURI": [
        {
          "sourcedId": "",
          "title": "",
          "uri": ""
        }
      ],
      "language": null,
      "version": null,
      "adoptionStatus": null,
      "statusStartDate": null,
      "statusEndDate": null,
      "licenseURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      },
      "notes": null,
      "extensions": null,
      "CFPackageURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      }
    },
    "CFItems": [
      {
        "sourcedId": "",
        "fullStatement": "",
        "alternativeLabel": null,
        "CFItemType": "",
        "uri": "",
        "humanCodingScheme": null,
        "listEnumeration": null,
        "abbreviatedStatement": null,
        "conceptKeywords": [
          ""
        ],
        "conceptKeywordsURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        },
        "notes": null,
        "subject": [
          ""
        ],
        "subjectURI": [
          {
            "sourcedId": "",
            "title": "",
            "uri": ""
          }
        ],
        "language": null,
        "educationLevel": [
          ""
        ],
        "CFItemTypeURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        },
        "licenseURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        },
        "statusStartDate": null,
        "statusEndDate": null,
        "lastChangeDateTime": "",
        "extensions": null,
        "CFDocumentURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        }
      }
    ],
    "CFAssociations": [
      {
        "sourcedId": "",
        "associationType": "",
        "sequenceNumber": null,
        "uri": "",
        "originNodeURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        },
        "destinationNodeURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        },
        "CFAssociationGroupingURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        },
        "lastChangeDateTime": "",
        "notes": null,
        "extensions": null,
        "CFDocumentURI": {
          "sourcedId": "",
          "title": "",
          "uri": ""
        }
      }
    ]
  }
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### Get CASE Package with Groups by ID

- **Method:** `GET`
- **Path:** `/ims/case/v1p1/CFPackages/{sourcedId}/groups`
- **Tags:** CASE - Learning Standards

Returns a complete CASE package with groups for the specified sourcedId

#### Responses

##### Status: 200 CASE Package with Groups

###### Content-Type: application/json

- **`CFPackageWithGroups` (required)**

  `object` — Represents a complete competency framework package with hierarchical groups organized by CFItemType. Each item contains childGroups organized by the CFItemType of children.

  - **`CFDocument` (required)**

    `object` — Represents a Competency Framework Document.

    - **`CFPackageURI` (required)**

      `object`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`creator` (required)**

      `string`

    - **`lastChangeDateTime` (required)**

      `string`, format: `date-time`

    - **`sourcedId` (required)**

      `string`, format: `uuid`

    - **`title` (required)**

      `string`

    - **`uri` (required)**

      `string`, format: `uri`

    - **`adoptionStatus`**

      `string | null`

    - **`caseVersion`**

      `string | null`, possible values: `"1.1", null`

    - **`description`**

      `string | null`

    - **`extensions`**

      `object | null`

    - **`frameworkType`**

      `string | null`

    - **`language`**

      `string | null`

    - **`licenseURI`**

      `object | null`

      - **`sourcedId` (required)**

        `string`, format: `uuid`

      - **`title` (required)**

        `string`

      - **`uri` (required)**

        `string`, format: `uri`

    - **`notes`**

      `string | null`

    - **`officialSourceURL`**

      `string | null`, format: `uri`

    - **`publisher`**

      `string | null`

    - **`statusEndDate`**

      `string | null`, format: `date`

    - **`statusStartDate`**

      `string | null`, format: `date`

    - **`subject`**

      `array | null`

    - **`subjectURI`**

      `array | null`

    - **`version`**

      `string | null`

  - **`sourcedId` (required)**

    `string`, format: `uuid`

  - **`structuredContent` (required)**

    `object`

**Example:**

```
{
  "CFPackageWithGroups": {
    "sourcedId": "",
    "CFDocument": {
      "sourcedId": "",
      "title": "",
      "uri": "",
      "frameworkType": null,
      "caseVersion": "1.1",
      "creator": "",
      "lastChangeDateTime": "",
      "officialSourceURL": null,
      "publisher": null,
      "description": null,
      "subject": [
        ""
      ],
      "subjectURI": [
        {
          "sourcedId": "",
          "title": "",
          "uri": ""
        }
      ],
      "language": null,
      "version": null,
      "adoptionStatus": null,
      "statusStartDate": null,
      "statusEndDate": null,
      "licenseURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      },
      "notes": null,
      "extensions": null,
      "CFPackageURI": {
        "sourcedId": "",
        "title": "",
        "uri": ""
      }
    },
    "structuredContent": {
      "propertyName*": [
        {
          "sourcedId": "",
          "fullStatement": "",
          "alternativeLabel": null,
          "CFItemType": "",
          "uri": "",
          "humanCodingScheme": null,
          "listEnumeration": null,
          "abbreviatedStatement": null,
          "conceptKeywords": [
            ""
          ],
          "conceptKeywordsURI": {
            "sourcedId": "",
            "title": "",
            "uri": ""
          },
          "...": "[Additional Properties Truncated]"
        }
      ]
    }
  }
}
```

##### Status: 400 Bad Request

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 401 Unauthorized

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 403 Forbidden

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 404 Not Found

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 422 Unprocessable Entity / Validation Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 429 Too Many Requests

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

##### Status: 500 Internal Server Error

###### Content-Type: application/json

- **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

- **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

- **`imsx_description` (required)**

  `string`

- **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

- **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

## Schemas

### BadRequestResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### UnauthorizedRequestResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unauthorisedrequest"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unauthorisedrequest"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### ForbiddenResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"forbidden"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "forbidden"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### NotFoundResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"unknownobject"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "unknownobject"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### UnprocessableEntityResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"invaliddata"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "invaliddata"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### TooManyRequestsResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"server_busy"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "server_busy"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```

### InternalServerErrorResponse

- **Type:**`object`

* **`imsx_codeMajor` (required)**

  `string`, default: `"failure"` — The major response code

* **`imsx_CodeMinor` (required)**

  `object`

  - **`imsx_codeMinorField` (required)**

    `array`

    **Items:**

    - **`imsx_codeMinorFieldName` (required)**

      `string`, default: `"TargetEndSystem"` — The field name for the minor code

    - **`imsx_codeMinorFieldValue` (required)**

      `string`, default: `"internal_server_error"` — The field value for the minor code

* **`imsx_description` (required)**

  `string`

* **`imsx_severity` (required)**

  `string`, default: `"error"` — The severity of the response

* **`imsx_error_details`**

  `array`

  **Items:**

**Example:**

```
{
  "imsx_codeMajor": "failure",
  "imsx_severity": "error",
  "imsx_description": "",
  "imsx_CodeMinor": {
    "imsx_codeMinorField": [
      {
        "imsx_codeMinorFieldName": "TargetEndSystem",
        "imsx_codeMinorFieldValue": "internal_server_error"
      }
    ]
  },
  "imsx_error_details": [
    {
      "propertyName*": ""
    }
  ]
}
```
