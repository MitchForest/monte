# OpenBadges API

> Generated from: https://api.alpha-1edtech.com/openBadges/openapi.yaml
> Generated on: 2025-09-18T03:08:05.938Z

---

# OpenBadge API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

Open Badges is a global standard for creating, issuing, and verifying digital micro-credentials that represent skills, achievements, learning outcomes, and experiences. It provides a common, interoperable language for recognizing accomplishments in a way that is portable, verifiable, and data-rich.

## Servers

- **URL:** `https://api.alpha-1edtech.com`
  - **Description:** OpenBadge API

## Operations

### Get Open Badges v3.0 API Discovery Information

- **Method:** `GET`
- **Path:** `/ims/ob/v3p0/discovery/`
- **Tags:** OpenBadge - Discovery

Returns the OpenAPI 3.0 specification for the Open Badges v3.0 API. This endpoint provides discovery information including available endpoints, OAuth2 flows, and supported scopes. This is a public endpoint that allows clients to dynamically discover the service's capabilities without prior configuration.

#### Responses

##### Status: 200 Discovery information returned successfully

###### Content-Type: application/json

**Example:**

```
{
  "propertyName*": "anything"
}
```

### Upsert a Verifiable Open Badge Credential

- **Method:** `POST`
- **Path:** `/ims/ob/v3p0/credentials/`
- **Tags:** OpenBadge - Credentials

Upserts (creates or updates) a Verifiable Open Badge Credential. This endpoint follows the Open Badges 3.0 specification for credential upsert operations. A credential is considered the same as another when both the issuer.id and the credential.id are equal.

```ocaml
- If a credential with the same issuer.id and credential.id already exists, it will be updated (HTTP 200)
- If no matching credential is found, a new credential will be created (HTTP 201)

The platform acts as the repository for these credentials, ensuring their authenticity and integrity 
through cryptographic proofs. All upserted credentials must be valid according to the Open Badges 3.0 
specification and include proper verification methods.
```

#### Request Body

##### Content-Type: application/json

- **`@context` (required)**

  `array`

  **Items:**

  `string`

- **`credentialSubject` (required)**

  `object`

  - **`achievement` (required)**

    `object`

    - **`criteria` (required)**

      `object`

      - **`narrative` (required)**

        `string`

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `string`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`address`**

        `string`

      - **`email`**

        `string`

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`caption`**

        `string`

  - **`id` (required)**

    `string`

  - **`identifier` (required)**

    `array`

    **Items:**

    - **`hashed` (required)**

      `boolean`

    - **`identityHash` (required)**

      `string`

    - **`identityType` (required)**

      `string`

    - **`type` (required)**

      `string`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

- **`id` (required)**

  `string`

- **`issuer` (required)**

  `object`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`image`**

  `object`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`caption`**

    `string`

- **`name`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`

  - **`cryptosuite` (required)**

    `string`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

- **`validUntil`**

  `string`

**Example:**

```
{
  "@context": [
    ""
  ],
  "id": "",
  "type": [
    ""
  ],
  "issuer": "",
  "name": "",
  "description": "",
  "image": {
    "id": "",
    "type": "",
    "caption": ""
  },
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "achievement": {
      "id": "",
      "type": [
        ""
      ],
      "name": "",
      "description": "",
      "criteria": {
        "narrative": ""
      },
      "image": {
        "id": "",
        "type": "",
        "caption": ""
      },
      "achievementType": "",
      "creator": {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "url": "",
        "email": "",
        "phone": "",
        "address": ""
      }
    },
    "identifier": [
      {
        "type": "",
        "identityHash": "",
        "identityType": "",
        "hashed": true
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "cryptosuite": "",
      "created": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "proofValue": ""
    }
  ],
  "validFrom": "",
  "validUntil": "",
  "credentialSchema": [
    {
      "id": "",
      "type": ""
    }
  ]
}
```

#### Responses

##### Status: 200 Credential successfully updated

###### Content-Type: application/json

- **`@context` (required)**

  `array`

  **Items:**

  `string`

- **`credentialSubject` (required)**

  `object`

  - **`achievement` (required)**

    `object`

    - **`criteria` (required)**

      `object`

      - **`narrative` (required)**

        `string`

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `string`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`address`**

        `string`

      - **`email`**

        `string`

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`caption`**

        `string`

  - **`id` (required)**

    `string`

  - **`identifier` (required)**

    `array`

    **Items:**

    - **`hashed` (required)**

      `boolean`

    - **`identityHash` (required)**

      `string`

    - **`identityType` (required)**

      `string`

    - **`type` (required)**

      `string`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

- **`id` (required)**

  `string`

- **`issuer` (required)**

  `object`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`image`**

  `object`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`caption`**

    `string`

- **`name`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`

  - **`cryptosuite` (required)**

    `string`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

- **`validUntil`**

  `string`

**Example:**

```
{
  "@context": [
    ""
  ],
  "id": "",
  "type": [
    ""
  ],
  "issuer": "",
  "name": "",
  "description": "",
  "image": {
    "id": "",
    "type": "",
    "caption": ""
  },
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "achievement": {
      "id": "",
      "type": [
        ""
      ],
      "name": "",
      "description": "",
      "criteria": {
        "narrative": ""
      },
      "image": {
        "id": "",
        "type": "",
        "caption": ""
      },
      "achievementType": "",
      "creator": {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "url": "",
        "email": "",
        "phone": "",
        "address": ""
      }
    },
    "identifier": [
      {
        "type": "",
        "identityHash": "",
        "identityType": "",
        "hashed": true
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "cryptosuite": "",
      "created": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "proofValue": ""
    }
  ],
  "validFrom": "",
  "validUntil": "",
  "credentialSchema": [
    {
      "id": "",
      "type": ""
    }
  ]
}
```

##### Status: 201 Credential successfully created

###### Content-Type: application/json

- **`@context` (required)**

  `array`

  **Items:**

  `string`

- **`credentialSubject` (required)**

  `object`

  - **`achievement` (required)**

    `object`

    - **`criteria` (required)**

      `object`

      - **`narrative` (required)**

        `string`

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `string`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`address`**

        `string`

      - **`email`**

        `string`

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`caption`**

        `string`

  - **`id` (required)**

    `string`

  - **`identifier` (required)**

    `array`

    **Items:**

    - **`hashed` (required)**

      `boolean`

    - **`identityHash` (required)**

      `string`

    - **`identityType` (required)**

      `string`

    - **`type` (required)**

      `string`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

- **`id` (required)**

  `string`

- **`issuer` (required)**

  `object`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`image`**

  `object`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`caption`**

    `string`

- **`name`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`

  - **`cryptosuite` (required)**

    `string`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

- **`validUntil`**

  `string`

**Example:**

```
{
  "@context": [
    ""
  ],
  "id": "",
  "type": [
    ""
  ],
  "issuer": "",
  "name": "",
  "description": "",
  "image": {
    "id": "",
    "type": "",
    "caption": ""
  },
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "achievement": {
      "id": "",
      "type": [
        ""
      ],
      "name": "",
      "description": "",
      "criteria": {
        "narrative": ""
      },
      "image": {
        "id": "",
        "type": "",
        "caption": ""
      },
      "achievementType": "",
      "creator": {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "url": "",
        "email": "",
        "phone": "",
        "address": ""
      }
    },
    "identifier": [
      {
        "type": "",
        "identityHash": "",
        "identityType": "",
        "hashed": true
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "cryptosuite": "",
      "created": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "proofValue": ""
    }
  ],
  "validFrom": "",
  "validUntil": "",
  "credentialSchema": [
    {
      "id": "",
      "type": ""
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

### Issue a Verifiable Open Badge Credential

- **Method:** `POST`
- **Path:** `/ims/ob/v3p0/issue-badge/`
- **Tags:** OpenBadge - Issue Badge

Processes achievement data submitted by an authorized external creator (e.g., university, school) and issues a new Open Badge v3.0 compliant Verifiable Credential (AchievementCredential). This platform acts as the 'issuer' of the Verifiable Credential, digitally signing it to ensure its authenticity and integrity. The 'userId' information provided in the request body will be embedded within the 'achievement' object of the issued badge. The resulting badge includes a cryptographic proof (e.g., JsonWebSignature2020) allowing any verifier to confirm that the badge was issued by this platform and has not been tampered with.

#### Request Body

##### Content-Type: application/json

- **`achievementId` (required)**

  `string`

- **`userId` (required)**

  `string` — The sourcedId of the user to issue the badge for

- **`awardedDate`**

  `string`, default: `"2025-09-16T22:49:12.476Z"`

- **`validFrom`**

  `string`, default: `"2025-09-16T22:49:12.476Z"`

- **`validUntil`**

  `string`

**Example:**

```
{
  "userId": "",
  "achievementId": "",
  "validFrom": "2025-09-16T22:49:12.476Z",
  "awardedDate": "2025-09-16T22:49:12.476Z",
  "validUntil": ""
}
```

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`@context` (required)**

  `array`

  **Items:**

  `string`

- **`credentialSubject` (required)**

  `object`

  - **`achievement` (required)**

    `object`

    - **`criteria` (required)**

      `object`

      - **`narrative` (required)**

        `string`

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `string`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`address`**

        `string`

      - **`email`**

        `string`

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`caption`**

        `string`

  - **`id` (required)**

    `string`

  - **`identifier` (required)**

    `array`

    **Items:**

    - **`hashed` (required)**

      `boolean`

    - **`identityHash` (required)**

      `string`

    - **`identityType` (required)**

      `string`

    - **`type` (required)**

      `string`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

- **`id` (required)**

  `string`

- **`issuer` (required)**

  `object`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`image`**

  `object`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`caption`**

    `string`

- **`name`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`

  - **`cryptosuite` (required)**

    `string`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

- **`validUntil`**

  `string`

**Example:**

```
{
  "@context": [
    ""
  ],
  "id": "",
  "type": [
    ""
  ],
  "issuer": "",
  "name": "",
  "description": "",
  "image": {
    "id": "",
    "type": "",
    "caption": ""
  },
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "achievement": {
      "id": "",
      "type": [
        ""
      ],
      "name": "",
      "description": "",
      "criteria": {
        "narrative": ""
      },
      "image": {
        "id": "",
        "type": "",
        "caption": ""
      },
      "achievementType": "",
      "creator": {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "url": "",
        "email": "",
        "phone": "",
        "address": ""
      }
    },
    "identifier": [
      {
        "type": "",
        "identityHash": "",
        "identityType": "",
        "hashed": true
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "cryptosuite": "",
      "created": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "proofValue": ""
    }
  ],
  "validFrom": "",
  "validUntil": "",
  "credentialSchema": [
    {
      "id": "",
      "type": ""
    }
  ]
}
```

### Verify an Open Badge Credential

- **Method:** `POST`
- **Path:** `/ims/ob/v3p0/issue-badge/verify`
- **Tags:** OpenBadge - Issue Badge

Verifies the authenticity and integrity of a presented Open Badge v3.0 (AchievementCredential). This endpoint checks the cryptographic proof (e.g., signature) embedded within the badge to ensure it was genuinely issued by the claimed issuer (as identified in the proof's verificationMethod) and that its contents have not been altered since issuance. It may also perform checks on timeliness (validFrom/validUntil). This endpoint conforms to the verification principles outlined in the Open Badges v3.0 specification and W3C Verifiable Credentials Data Model.

#### Request Body

##### Content-Type: application/json

- **`@context` (required)**

  `array`

  **Items:**

  `string`

- **`credentialSubject` (required)**

  `object`

  - **`achievement` (required)**

    `object`

    - **`criteria` (required)**

      `object`

      - **`narrative` (required)**

        `string`

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `string`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`address`**

        `string`

      - **`email`**

        `string`

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`caption`**

        `string`

  - **`id` (required)**

    `string`

  - **`identifier` (required)**

    `array`

    **Items:**

    - **`hashed` (required)**

      `boolean`

    - **`identityHash` (required)**

      `string`

    - **`identityType` (required)**

      `string`

    - **`type` (required)**

      `string`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

- **`id` (required)**

  `string`

- **`issuer` (required)**

  `object`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`image`**

  `object`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`caption`**

    `string`

- **`name`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`

  - **`cryptosuite` (required)**

    `string`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

- **`validUntil`**

  `string`

**Example:**

```
{
  "@context": [
    ""
  ],
  "id": "",
  "type": [
    ""
  ],
  "issuer": "",
  "name": "",
  "description": "",
  "image": {
    "id": "",
    "type": "",
    "caption": ""
  },
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "achievement": {
      "id": "",
      "type": [
        ""
      ],
      "name": "",
      "description": "",
      "criteria": {
        "narrative": ""
      },
      "image": {
        "id": "",
        "type": "",
        "caption": ""
      },
      "achievementType": "",
      "creator": {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "url": "",
        "email": "",
        "phone": "",
        "address": ""
      }
    },
    "identifier": [
      {
        "type": "",
        "identityHash": "",
        "identityType": "",
        "hashed": true
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "cryptosuite": "",
      "created": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "proofValue": ""
    }
  ],
  "validFrom": "",
  "validUntil": "",
  "credentialSchema": [
    {
      "id": "",
      "type": ""
    }
  ]
}
```

#### Responses

##### Status: 200 Successful response

###### Content-Type: application/json

- **`errors` (required)**

  `array`

  **Items:**

  `string`

- **`valid` (required)**

  `boolean`

- **`warnings` (required)**

  `array`

  **Items:**

  `string`

- **`details`**

  `object`

  - **`achievement`**

    `string`

  - **`credentialCount`**

    `number`

  - **`issuer`**

    `string`

  - **`signatureMethod`**

    `string`

  - **`subject`**

    `string`

**Example:**

```
{
  "valid": true,
  "errors": [
    ""
  ],
  "warnings": [
    ""
  ],
  "details": {
    "issuer": "",
    "subject": "",
    "achievement": "",
    "signatureMethod": "",
    "credentialCount": 1
  }
}
```

### Get all Achievements

- **Method:** `GET`
- **Path:** `/ims/ob/v3p0/achievements/`
- **Tags:** OpenBadge - Achievements

To get all Achievements on the service provider.

#### Responses

##### Status: 200 Successful response with a list of achievements

###### Content-Type: application/json

- **`achievements` (required)**

  `array`

  **Items:**

  - **`achievementType` (required)**

    `string`, possible values: `"Achievement", "ApprenticeshipCertificate", "Assessment", "Assignment", "AssociateDegree", "Award", "Badge", "BachelorDegree", "Certificate", "CertificateOfCompletion", "Certification", "CommunityService", "Competency", "Course", "CoCurricular", "Degree", "Diploma", "DoctoralDegree", "Fieldwork", "GeneralEducationDevelopment", "JourneymanCertificate", "LearningProgram", "License", "Membership", "ProfessionalDoctorate", "QualityAssuranceCredential", "MasterCertificate", "MasterDegree", "MicroCredential", "ResearchDoctorate", "SecondarySchoolDiploma"`, default: `"Achievement"`

  - **`criteria` (required)**

    `string`

  - **`description` (required)**

    `string`

  - **`name` (required)**

    `string`

  - **`sourcedId` (required)**

    `string`

  - **`status` (required)**

    `string`, possible values: `"active", "tobedeleted"`

  - **`tag` (required)**

    `array`, default: `[]`

    **Items:**

    `string`

  - **`dateLastModified`**

    `string`, format: `date-time`

  - **`image`**

    `string`

  - **`metadata`**

    `object` — Additional metadata for the object

- **`limit` (required)**

  `number`

- **`offset` (required)**

  `number`

- **`pageCount` (required)**

  `number`

- **`pageNumber` (required)**

  `number`

- **`totalCount` (required)**

  `number`

**Example:**

```
{
  "achievements": [
    {
      "sourcedId": "",
      "status": "active",
      "dateLastModified": "",
      "metadata": {
        "propertyName*": "anything"
      },
      "name": "",
      "description": "",
      "achievementType": "Achievement",
      "criteria": "",
      "image": "",
      "tag": []
    }
  ],
  "totalCount": 1,
  "pageCount": 1,
  "pageNumber": 1,
  "offset": 1,
  "limit": 1
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

### Create a new Achievement

- **Method:** `POST`
- **Path:** `/ims/ob/v3p0/achievements/`
- **Tags:** OpenBadge - Achievements

To create a new Achievement. The responding system must return the set of sourcedIds that have been allocated to the newly created achievement record.

#### Request Body

##### Content-Type: application/json

- **`achievement` (required)**

  `object`

  - **`criteria` (required)**

    `string`

  - **`description` (required)**

    `string`

  - **`name` (required)**

    `string`

  - **`achievementType`**

    `string`, possible values: `"Achievement", "ApprenticeshipCertificate", "Assessment", "Assignment", "AssociateDegree", "Award", "Badge", "BachelorDegree", "Certificate", "CertificateOfCompletion", "Certification", "CommunityService", "Competency", "Course", "CoCurricular", "Degree", "Diploma", "DoctoralDegree", "Fieldwork", "GeneralEducationDevelopment", "JourneymanCertificate", "LearningProgram", "License", "Membership", "ProfessionalDoctorate", "QualityAssuranceCredential", "MasterCertificate", "MasterDegree", "MicroCredential", "ResearchDoctorate", "SecondarySchoolDiploma"`, default: `"Achievement"`

  - **`image`**

    `string`

  - **`sourcedId`**

    `string`

  - **`status`**

    `string`, possible values: `"active", "tobedeleted"`, default: `"active"`

  - **`tag`**

    `array`, default: `[]`

    **Items:**

    `string`

**Example:**

```
{
  "achievement": {
    "sourcedId": "",
    "status": "active",
    "name": "",
    "description": "",
    "achievementType": "Achievement",
    "criteria": "",
    "image": "",
    "tag": []
  }
}
```

#### Responses

##### Status: 201 Achievement successfully created

###### Content-Type: application/json

- **`sourcedIdPairs` (required)**

  `object`

  - **`allocatedSourcedId` (required)**

    `string`

  - **`suppliedSourcedId` (required)**

    `string`

**Example:**

```
{
  "sourcedIdPairs": {
    "suppliedSourcedId": "",
    "allocatedSourcedId": ""
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

### Get a specific achievement

- **Method:** `GET`
- **Path:** `/ims/ob/v3p0/achievements/{sourcedId}`
- **Tags:** OpenBadge - Achievements

Get a specific Achievement on the service provider. If the corresponding record cannot be located, the api will return a 404 error code and message 'Achievement not found.'

#### Responses

##### Status: 200 Successful response with the requested achievement

###### Content-Type: application/json

- **`achievement` (required)**

  `object`

  - **`achievementType` (required)**

    `string`, possible values: `"Achievement", "ApprenticeshipCertificate", "Assessment", "Assignment", "AssociateDegree", "Award", "Badge", "BachelorDegree", "Certificate", "CertificateOfCompletion", "Certification", "CommunityService", "Competency", "Course", "CoCurricular", "Degree", "Diploma", "DoctoralDegree", "Fieldwork", "GeneralEducationDevelopment", "JourneymanCertificate", "LearningProgram", "License", "Membership", "ProfessionalDoctorate", "QualityAssuranceCredential", "MasterCertificate", "MasterDegree", "MicroCredential", "ResearchDoctorate", "SecondarySchoolDiploma"`, default: `"Achievement"`

  - **`criteria` (required)**

    `string`

  - **`description` (required)**

    `string`

  - **`name` (required)**

    `string`

  - **`sourcedId` (required)**

    `string`

  - **`status` (required)**

    `string`, possible values: `"active", "tobedeleted"`

  - **`tag` (required)**

    `array`, default: `[]`

    **Items:**

    `string`

  - **`dateLastModified`**

    `string`, format: `date-time`

  - **`image`**

    `string`

  - **`metadata`**

    `object` — Additional metadata for the object

**Example:**

```
{
  "achievement": {
    "sourcedId": "",
    "status": "active",
    "dateLastModified": "",
    "metadata": {
      "propertyName*": "anything"
    },
    "name": "",
    "description": "",
    "achievementType": "Achievement",
    "criteria": "",
    "image": "",
    "tag": []
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

##### Status: 404 Achievement not found

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

### Update an Achievement

- **Method:** `PUT`
- **Path:** `/ims/ob/v3p0/achievements/{sourcedId}`
- **Tags:** OpenBadge - Achievements

To update an existing Achievement. The sourcedId for the record to be updated is supplied by the requesting system.

#### Request Body

##### Content-Type: application/json

- **`achievement` (required)**

  `object`

  - **`achievementType`**

    `string`, possible values: `"Achievement", "ApprenticeshipCertificate", "Assessment", "Assignment", "AssociateDegree", "Award", "Badge", "BachelorDegree", "Certificate", "CertificateOfCompletion", "Certification", "CommunityService", "Competency", "Course", "CoCurricular", "Degree", "Diploma", "DoctoralDegree", "Fieldwork", "GeneralEducationDevelopment", "JourneymanCertificate", "LearningProgram", "License", "Membership", "ProfessionalDoctorate", "QualityAssuranceCredential", "MasterCertificate", "MasterDegree", "MicroCredential", "ResearchDoctorate", "SecondarySchoolDiploma"`

  - **`criteria`**

    `string`

  - **`description`**

    `string`

  - **`image`**

    `string`

  - **`name`**

    `string`

  - **`tag`**

    `array`

    **Items:**

    `string`

**Example:**

```
{
  "achievement": {
    "name": "",
    "description": "",
    "achievementType": "Achievement",
    "criteria": "",
    "image": "",
    "tag": [
      ""
    ]
  }
}
```

#### Responses

##### Status: 204 Achievement successfully updated

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

##### Status: 404 Achievement not found

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

### Delete an Achievement

- **Method:** `DELETE`
- **Path:** `/ims/ob/v3p0/achievements/{sourcedId}`
- **Tags:** OpenBadge - Achievements

Perform a soft delete on a specific Achievement on the service provider. This operation changes the status of the Achievement to 'tobedeleted'.

#### Responses

##### Status: 204 Achievement successfully deleted

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

##### Status: 404 Achievement not found

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

### Get achievements for a Student

- **Method:** `GET`
- **Path:** `/ims/ob/v3p0/achievements/students/{studentSourcedId}`
- **Tags:** OpenBadge - Achievements

To get all achievements for a specific Student. If the corresponding record cannot be located, the api will return a 404 error code and message 'Student not found.'

#### Responses

##### Status: 200 Successful response with the list of achievements

###### Content-Type: application/json

- **`achievementsWithIssuedBadges` (required)**

  `array`

  **Items:**

  - **`achievementType` (required)**

    `string`, possible values: `"Achievement", "ApprenticeshipCertificate", "Assessment", "Assignment", "AssociateDegree", "Award", "Badge", "BachelorDegree", "Certificate", "CertificateOfCompletion", "Certification", "CommunityService", "Competency", "Course", "CoCurricular", "Degree", "Diploma", "DoctoralDegree", "Fieldwork", "GeneralEducationDevelopment", "JourneymanCertificate", "LearningProgram", "License", "Membership", "ProfessionalDoctorate", "QualityAssuranceCredential", "MasterCertificate", "MasterDegree", "MicroCredential", "ResearchDoctorate", "SecondarySchoolDiploma"`, default: `"Achievement"`

  - **`criteria` (required)**

    `string`

  - **`description` (required)**

    `string`

  - **`issuedBadges` (required)**

    `array`

    **Items:**

    - **`achievementSourcedId` (required)**

      `string`

    - **`creatorId` (required)**

      `string`

    - **`data` (required)**

      `object`

      - **`@context` (required)**

        `array`

        **Items:**

        `string`

      - **`credentialSubject` (required)**

        `object`

        - **`achievement` (required)**

          `object`

          - **`criteria` (required)**

            `object`

            - **`narrative` (required)**

              `string`

          - **`description` (required)**

            `string`

          - **`id` (required)**

            `string`

          - **`name` (required)**

            `string`

          - **`type` (required)**

            `array`

            **Items:**

            `string`

          - **`achievementType`**

            `string`

          - **`creator`**

            `object`

            - **`id` (required)**

              `string`

            - **`type` (required)**

              `array`

              **Items:**

              `string`

            - **`address`**

              `string`

            - **`email`**

              `string`

            - **`name`**

              `string`

            - **`phone`**

              `string`

            - **`url`**

              `string`

          - **`image`**

            `object`

            - **`id` (required)**

              `string`

            - **`type` (required)**

              `string`

            - **`caption`**

              `string`

        - **`id` (required)**

          `string`

        - **`identifier` (required)**

          `array`

          **Items:**

          - **`hashed` (required)**

            `boolean`

          - **`identityHash` (required)**

            `string`

          - **`identityType` (required)**

            `string`

          - **`type` (required)**

            `string`

        - **`type` (required)**

          `array`

          **Items:**

          `string`

      - **`id` (required)**

        `string`

      - **`issuer` (required)**

        `object`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`validFrom` (required)**

        `string`

      - **`credentialSchema`**

        `array`

        **Items:**

        - **`id` (required)**

          `string`

        - **`type` (required)**

          `string`

      - **`description`**

        `string`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`

        - **`type` (required)**

          `string`

        - **`caption`**

          `string`

      - **`name`**

        `string`

      - **`proof`**

        `array`

        **Items:**

        - **`created` (required)**

          `string`

        - **`cryptosuite` (required)**

          `string`

        - **`proofPurpose` (required)**

          `string`

        - **`proofValue` (required)**

          `string`

        - **`type` (required)**

          `string`

        - **`verificationMethod` (required)**

          `string`

      - **`validUntil`**

        `string`

    - **`dateEarned` (required)**

      `string`

    - **`status` (required)**

      `string`, possible values: `"active", "tobedeleted"`

    - **`studentSourcedId` (required)**

      `string`

  - **`name` (required)**

    `string`

  - **`sourcedId` (required)**

    `string`

  - **`status` (required)**

    `string`, possible values: `"active", "tobedeleted"`

  - **`tag` (required)**

    `array`, default: `[]`

    **Items:**

    `string`

  - **`dateLastModified`**

    `string`, format: `date-time`

  - **`image`**

    `string`

  - **`metadata`**

    `object` — Additional metadata for the object

- **`limit` (required)**

  `number`

- **`offset` (required)**

  `number`

- **`pageCount` (required)**

  `number`

- **`pageNumber` (required)**

  `number`

- **`totalCount` (required)**

  `number`

**Example:**

```
{
  "achievementsWithIssuedBadges": [
    {
      "sourcedId": "",
      "status": "active",
      "dateLastModified": "",
      "metadata": {
        "propertyName*": "anything"
      },
      "name": "",
      "description": "",
      "achievementType": "Achievement",
      "criteria": "",
      "image": "",
      "tag": [],
      "issuedBadges": [
        {
          "creatorId": "",
          "studentSourcedId": "",
          "achievementSourcedId": "",
          "dateEarned": "",
          "data": {
            "@context": [
              ""
            ],
            "id": "",
            "type": [
              ""
            ],
            "issuer": "",
            "name": "",
            "description": "",
            "image": {
              "id": "",
              "type": "",
              "caption": ""
            },
            "credentialSubject": {
              "id": "",
              "type": [
                ""
              ],
              "achievement": {
                "id": "",
                "type": [
                  ""
                ],
                "name": "",
                "description": "",
                "criteria": {
                  "narrative": ""
                },
                "image": {
                  "id": "",
                  "type": "",
                  "caption": ""
                },
                "achievementType": "",
                "creator": {
                  "id": "",
                  "type": [
                    ""
                  ],
                  "name": "",
                  "url": "",
                  "email": "",
                  "phone": "",
                  "address": ""
                }
              },
              "identifier": [
                {
                  "type": "",
                  "identityHash": "",
                  "identityType": "",
                  "hashed": true
                }
              ]
            },
            "proof": [
              {
                "type": "",
                "cryptosuite": "",
                "created": "",
                "proofPurpose": "",
                "verificationMethod": "",
                "proofValue": ""
              }
            ],
            "validFrom": "",
            "...": "[Additional Properties Truncated]"
          },
          "status": "active"
        }
      ]
    }
  ],
  "totalCount": 1,
  "pageCount": 1,
  "pageNumber": 1,
  "offset": 1,
  "limit": 1
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

##### Status: 404 Student not found

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
