# CLR API

> Generated from: https://api.alpha-1edtech.com/clr/openapi.yaml
> Generated on: 2025-09-18T03:08:05.436Z

---

# CLR API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

Comprehensive Learner Record (CLR) is a standard for creating, transmitting, and rendering an individual's full set of achievements, issued by multiple learning providers, in a machine-readable and verifiable digital format. It enables the curation of diverse learning experiences—including courses, competencies, co-curricular activities, and badges—into a single, interoperable record that supports a learner's lifelong educational and career journey.

## Servers

- **URL:** `https://api.alpha-1edtech.com`
  - **Description:** CLR API

## Operations

### Get CLR v2.0 API Discovery Information

- **Method:** `GET`
- **Path:** `/ims/clr/v2p0/discovery/`
- **Tags:** CLR - Discovery

Returns the OpenAPI 3.0 specification for the CLR v2.0 API. This endpoint provides discovery information including available endpoints, OAuth2 flows, and supported scopes. This is a public endpoint that allows clients to dynamically discover the service's capabilities without prior configuration.

#### Responses

##### Status: 200 Discovery information returned successfully

###### Content-Type: application/json

**Example:**

```
{
  "propertyName*": "anything"
}
```

### Upsert a Verifiable Comprehensive Learner Record (CLR)

- **Method:** `POST`
- **Path:** `/ims/clr/v2p0/credentials/`
- **Tags:** CLR - Credentials

Upserts a Comprehensive Learner Record (CLR) v2.0 compliant Verifiable Credential (ClrCredential). This platform acts as the 'publisher' of the overarching ClrCredential, digitally signing it to ensure its authenticity and integrity. The ClrCredential packages a collection of individual assertions (e.g., AchievementCredentials, OpenBadgeCredentials, or other Verifiable Credentials) about the learner. The learner's identity information is embedded within the 'credentialSubject' of the main ClrCredential. The resulting CLR includes a cryptographic proof (e.g., DataIntegrityProof or JsonWebSignature2020) allowing any verifier to confirm that the CLR was issued by this platform and has not been tampered with since its issuance.

#### Request Body

##### Content-Type: application/json

- **`@context` (required)**

  `array`

  **Items:**

  `string`

- **`credentialSubject` (required)**

  `object`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

  - **`verifiableCredential` (required)**

    `array`

    **Items:**

    - **`@context` (required)**

      `array`

      **Items:**

      `string`

    - **`credentialSubject` (required)**

      `object`

      - **`id`**

        `string`

    - **`id` (required)**

      `string`

    - **`issuer` (required)**

      `object`

      - **`id` (required)**

        `string`, format: `uri`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`, format: `email`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`, format: `uri` — The URI or Data URI of the image.

        - **`type` (required)**

          `string` — MUST be the IRI 'Image'.

        - **`caption`**

          `string` — The caption for the image.

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`, format: `uri`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`validFrom` (required)**

      `string`, format: `date-time`

    - **`proof`**

      `array`

      **Items:**

      - **`created` (required)**

        `string`, format: `date-time`

      - **`proofPurpose` (required)**

        `string`

      - **`proofValue` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`verificationMethod` (required)**

        `string`

      - **`cryptosuite`**

        `string`

    - **`validUntil`**

      `string`, format: `date-time`

  - **`achievement`**

    `array`

    **Items:**

    - **`criteria` (required)**

      `object`

      - **`id`**

        `string`, format: `uri` — The URI of a webpage that describes the criteria.

      - **`narrative`**

        `string` — A narrative of what is needed to earn the achievement.

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`, format: `uri`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `object`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`, format: `uri`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`, format: `email`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`, format: `uri` — The URI or Data URI of the image.

        - **`type` (required)**

          `string` — MUST be the IRI 'Image'.

        - **`caption`**

          `string` — The caption for the image.

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`, format: `uri`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`, format: `uri` — The URI or Data URI of the image.

      - **`type` (required)**

        `string` — MUST be the IRI 'Image'.

      - **`caption`**

        `string` — The caption for the image.

  - **`association`**

    `array`

    **Items:**

    - **`associationType` (required)**

      `string`, possible values: `"exactMatchOf", "isChildOf", "isParentOf", "isPartOf", "isPeerOf", "isRelatedTo", "precedes", "replacedBy"`

    - **`sourceId` (required)**

      `string`, format: `uri`

    - **`targetId` (required)**

      `string`, format: `uri`

    - **`type` (required)**

      `string`

  - **`id`**

    `string`, format: `uri`

  - **`identifier`**

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

    - **`salt`**

      `string`

- **`id` (required)**

  `string`, format: `uri`

- **`issuer` (required)**

  `object`

  - **`id` (required)**

    `string`, format: `uri`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

  - **`description`**

    `string`

  - **`email`**

    `string`, format: `email`

  - **`image`**

    `object`

    - **`id` (required)**

      `string`, format: `uri` — The URI or Data URI of the image.

    - **`type` (required)**

      `string` — MUST be the IRI 'Image'.

    - **`caption`**

      `string` — The caption for the image.

  - **`name`**

    `string`

  - **`phone`**

    `string`

  - **`url`**

    `string`, format: `uri`

- **`name` (required)**

  `string`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`, format: `date-time`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`, format: `date-time`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

  - **`cryptosuite`**

    `string`

- **`validUntil`**

  `string`, format: `date-time`

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
  "issuer": {
    "id": "",
    "type": [
      ""
    ],
    "name": "",
    "url": "",
    "phone": "",
    "description": "",
    "image": {
      "id": "",
      "type": "Image",
      "caption": ""
    },
    "email": ""
  },
  "name": "",
  "description": "",
  "validFrom": "",
  "validUntil": "",
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "identifier": [
      {
        "type": "IdentityObject",
        "identityHash": "",
        "identityType": "",
        "hashed": true,
        "salt": ""
      }
    ],
    "achievement": [
      {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "description": "",
        "criteria": {
          "id": "",
          "narrative": ""
        },
        "image": {
          "id": "",
          "type": "Image",
          "caption": ""
        },
        "achievementType": "Achievement",
        "creator": {
          "id": "",
          "type": [
            ""
          ],
          "name": "",
          "url": "",
          "phone": "",
          "description": "",
          "image": {
            "id": "",
            "type": "Image",
            "caption": ""
          },
          "email": ""
        }
      }
    ],
    "verifiableCredential": [
      {
        "@context": [
          ""
        ],
        "id": "",
        "type": [
          ""
        ],
        "issuer": {
          "id": "",
          "type": [
            ""
          ],
          "name": "",
          "url": "",
          "phone": "",
          "description": "",
          "image": {
            "id": "",
            "type": "Image",
            "caption": ""
          },
          "email": ""
        },
        "validFrom": "",
        "validUntil": "",
        "credentialSubject": {
          "id": ""
        },
        "proof": [
          {
            "type": "",
            "proofPurpose": "",
            "verificationMethod": "",
            "created": "",
            "proofValue": "",
            "cryptosuite": ""
          }
        ]
      }
    ],
    "association": [
      {
        "type": "Association",
        "associationType": "exactMatchOf",
        "sourceId": "",
        "targetId": ""
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "created": "",
      "proofValue": "",
      "cryptosuite": ""
    }
  ],
  "credentialSchema": [
    {
      "id": "",
      "type": "1EdTechJsonSchemaValidator2019"
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

  - **`type` (required)**

    `array`

    **Items:**

    `string`

  - **`verifiableCredential` (required)**

    `array`

    **Items:**

    - **`@context` (required)**

      `array`

      **Items:**

      `string`

    - **`credentialSubject` (required)**

      `object`

      - **`id`**

        `string`

    - **`id` (required)**

      `string`

    - **`issuer` (required)**

      `object`

      - **`id` (required)**

        `string`, format: `uri`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`, format: `email`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`, format: `uri` — The URI or Data URI of the image.

        - **`type` (required)**

          `string` — MUST be the IRI 'Image'.

        - **`caption`**

          `string` — The caption for the image.

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`, format: `uri`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`validFrom` (required)**

      `string`, format: `date-time`

    - **`proof`**

      `array`

      **Items:**

      - **`created` (required)**

        `string`, format: `date-time`

      - **`proofPurpose` (required)**

        `string`

      - **`proofValue` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`verificationMethod` (required)**

        `string`

      - **`cryptosuite`**

        `string`

    - **`validUntil`**

      `string`, format: `date-time`

  - **`achievement`**

    `array`

    **Items:**

    - **`criteria` (required)**

      `object`

      - **`id`**

        `string`, format: `uri` — The URI of a webpage that describes the criteria.

      - **`narrative`**

        `string` — A narrative of what is needed to earn the achievement.

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`, format: `uri`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `object`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`, format: `uri`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`, format: `email`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`, format: `uri` — The URI or Data URI of the image.

        - **`type` (required)**

          `string` — MUST be the IRI 'Image'.

        - **`caption`**

          `string` — The caption for the image.

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`, format: `uri`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`, format: `uri` — The URI or Data URI of the image.

      - **`type` (required)**

        `string` — MUST be the IRI 'Image'.

      - **`caption`**

        `string` — The caption for the image.

  - **`association`**

    `array`

    **Items:**

    - **`associationType` (required)**

      `string`, possible values: `"exactMatchOf", "isChildOf", "isParentOf", "isPartOf", "isPeerOf", "isRelatedTo", "precedes", "replacedBy"`

    - **`sourceId` (required)**

      `string`, format: `uri`

    - **`targetId` (required)**

      `string`, format: `uri`

    - **`type` (required)**

      `string`

  - **`id`**

    `string`, format: `uri`

  - **`identifier`**

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

    - **`salt`**

      `string`

- **`id` (required)**

  `string`, format: `uri`

- **`issuer` (required)**

  `object`

  - **`id` (required)**

    `string`, format: `uri`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

  - **`description`**

    `string`

  - **`email`**

    `string`, format: `email`

  - **`image`**

    `object`

    - **`id` (required)**

      `string`, format: `uri` — The URI or Data URI of the image.

    - **`type` (required)**

      `string` — MUST be the IRI 'Image'.

    - **`caption`**

      `string` — The caption for the image.

  - **`name`**

    `string`

  - **`phone`**

    `string`

  - **`url`**

    `string`, format: `uri`

- **`name` (required)**

  `string`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`, format: `date-time`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`, format: `date-time`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

  - **`cryptosuite`**

    `string`

- **`validUntil`**

  `string`, format: `date-time`

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
  "issuer": {
    "id": "",
    "type": [
      ""
    ],
    "name": "",
    "url": "",
    "phone": "",
    "description": "",
    "image": {
      "id": "",
      "type": "Image",
      "caption": ""
    },
    "email": ""
  },
  "name": "",
  "description": "",
  "validFrom": "",
  "validUntil": "",
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "identifier": [
      {
        "type": "IdentityObject",
        "identityHash": "",
        "identityType": "",
        "hashed": true,
        "salt": ""
      }
    ],
    "achievement": [
      {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "description": "",
        "criteria": {
          "id": "",
          "narrative": ""
        },
        "image": {
          "id": "",
          "type": "Image",
          "caption": ""
        },
        "achievementType": "Achievement",
        "creator": {
          "id": "",
          "type": [
            ""
          ],
          "name": "",
          "url": "",
          "phone": "",
          "description": "",
          "image": {
            "id": "",
            "type": "Image",
            "caption": ""
          },
          "email": ""
        }
      }
    ],
    "verifiableCredential": [
      {
        "@context": [
          ""
        ],
        "id": "",
        "type": [
          ""
        ],
        "issuer": {
          "id": "",
          "type": [
            ""
          ],
          "name": "",
          "url": "",
          "phone": "",
          "description": "",
          "image": {
            "id": "",
            "type": "Image",
            "caption": ""
          },
          "email": ""
        },
        "validFrom": "",
        "validUntil": "",
        "credentialSubject": {
          "id": ""
        },
        "proof": [
          {
            "type": "",
            "proofPurpose": "",
            "verificationMethod": "",
            "created": "",
            "proofValue": "",
            "cryptosuite": ""
          }
        ]
      }
    ],
    "association": [
      {
        "type": "Association",
        "associationType": "exactMatchOf",
        "sourceId": "",
        "targetId": ""
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "created": "",
      "proofValue": "",
      "cryptosuite": ""
    }
  ],
  "credentialSchema": [
    {
      "id": "",
      "type": "1EdTechJsonSchemaValidator2019"
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

  - **`type` (required)**

    `array`

    **Items:**

    `string`

  - **`verifiableCredential` (required)**

    `array`

    **Items:**

    - **`@context` (required)**

      `array`

      **Items:**

      `string`

    - **`credentialSubject` (required)**

      `object`

      - **`id`**

        `string`

    - **`id` (required)**

      `string`

    - **`issuer` (required)**

      `object`

      - **`id` (required)**

        `string`, format: `uri`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`, format: `email`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`, format: `uri` — The URI or Data URI of the image.

        - **`type` (required)**

          `string` — MUST be the IRI 'Image'.

        - **`caption`**

          `string` — The caption for the image.

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`, format: `uri`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`validFrom` (required)**

      `string`, format: `date-time`

    - **`proof`**

      `array`

      **Items:**

      - **`created` (required)**

        `string`, format: `date-time`

      - **`proofPurpose` (required)**

        `string`

      - **`proofValue` (required)**

        `string`

      - **`type` (required)**

        `string`

      - **`verificationMethod` (required)**

        `string`

      - **`cryptosuite`**

        `string`

    - **`validUntil`**

      `string`, format: `date-time`

  - **`achievement`**

    `array`

    **Items:**

    - **`criteria` (required)**

      `object`

      - **`id`**

        `string`, format: `uri` — The URI of a webpage that describes the criteria.

      - **`narrative`**

        `string` — A narrative of what is needed to earn the achievement.

    - **`description` (required)**

      `string`

    - **`id` (required)**

      `string`, format: `uri`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `array`

      **Items:**

      `string`

    - **`achievementType`**

      `object`

    - **`creator`**

      `object`

      - **`id` (required)**

        `string`, format: `uri`

      - **`type` (required)**

        `array`

        **Items:**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`, format: `email`

      - **`image`**

        `object`

        - **`id` (required)**

          `string`, format: `uri` — The URI or Data URI of the image.

        - **`type` (required)**

          `string` — MUST be the IRI 'Image'.

        - **`caption`**

          `string` — The caption for the image.

      - **`name`**

        `string`

      - **`phone`**

        `string`

      - **`url`**

        `string`, format: `uri`

    - **`image`**

      `object`

      - **`id` (required)**

        `string`, format: `uri` — The URI or Data URI of the image.

      - **`type` (required)**

        `string` — MUST be the IRI 'Image'.

      - **`caption`**

        `string` — The caption for the image.

  - **`association`**

    `array`

    **Items:**

    - **`associationType` (required)**

      `string`, possible values: `"exactMatchOf", "isChildOf", "isParentOf", "isPartOf", "isPeerOf", "isRelatedTo", "precedes", "replacedBy"`

    - **`sourceId` (required)**

      `string`, format: `uri`

    - **`targetId` (required)**

      `string`, format: `uri`

    - **`type` (required)**

      `string`

  - **`id`**

    `string`, format: `uri`

  - **`identifier`**

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

    - **`salt`**

      `string`

- **`id` (required)**

  `string`, format: `uri`

- **`issuer` (required)**

  `object`

  - **`id` (required)**

    `string`, format: `uri`

  - **`type` (required)**

    `array`

    **Items:**

    `string`

  - **`description`**

    `string`

  - **`email`**

    `string`, format: `email`

  - **`image`**

    `object`

    - **`id` (required)**

      `string`, format: `uri` — The URI or Data URI of the image.

    - **`type` (required)**

      `string` — MUST be the IRI 'Image'.

    - **`caption`**

      `string` — The caption for the image.

  - **`name`**

    `string`

  - **`phone`**

    `string`

  - **`url`**

    `string`, format: `uri`

- **`name` (required)**

  `string`

- **`type` (required)**

  `array`

  **Items:**

  `string`

- **`validFrom` (required)**

  `string`, format: `date-time`

- **`credentialSchema`**

  `array`

  **Items:**

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`

- **`description`**

  `string`

- **`proof`**

  `array`

  **Items:**

  - **`created` (required)**

    `string`, format: `date-time`

  - **`proofPurpose` (required)**

    `string`

  - **`proofValue` (required)**

    `string`

  - **`type` (required)**

    `string`

  - **`verificationMethod` (required)**

    `string`

  - **`cryptosuite`**

    `string`

- **`validUntil`**

  `string`, format: `date-time`

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
  "issuer": {
    "id": "",
    "type": [
      ""
    ],
    "name": "",
    "url": "",
    "phone": "",
    "description": "",
    "image": {
      "id": "",
      "type": "Image",
      "caption": ""
    },
    "email": ""
  },
  "name": "",
  "description": "",
  "validFrom": "",
  "validUntil": "",
  "credentialSubject": {
    "id": "",
    "type": [
      ""
    ],
    "identifier": [
      {
        "type": "IdentityObject",
        "identityHash": "",
        "identityType": "",
        "hashed": true,
        "salt": ""
      }
    ],
    "achievement": [
      {
        "id": "",
        "type": [
          ""
        ],
        "name": "",
        "description": "",
        "criteria": {
          "id": "",
          "narrative": ""
        },
        "image": {
          "id": "",
          "type": "Image",
          "caption": ""
        },
        "achievementType": "Achievement",
        "creator": {
          "id": "",
          "type": [
            ""
          ],
          "name": "",
          "url": "",
          "phone": "",
          "description": "",
          "image": {
            "id": "",
            "type": "Image",
            "caption": ""
          },
          "email": ""
        }
      }
    ],
    "verifiableCredential": [
      {
        "@context": [
          ""
        ],
        "id": "",
        "type": [
          ""
        ],
        "issuer": {
          "id": "",
          "type": [
            ""
          ],
          "name": "",
          "url": "",
          "phone": "",
          "description": "",
          "image": {
            "id": "",
            "type": "Image",
            "caption": ""
          },
          "email": ""
        },
        "validFrom": "",
        "validUntil": "",
        "credentialSubject": {
          "id": ""
        },
        "proof": [
          {
            "type": "",
            "proofPurpose": "",
            "verificationMethod": "",
            "created": "",
            "proofValue": "",
            "cryptosuite": ""
          }
        ]
      }
    ],
    "association": [
      {
        "type": "Association",
        "associationType": "exactMatchOf",
        "sourceId": "",
        "targetId": ""
      }
    ]
  },
  "proof": [
    {
      "type": "",
      "proofPurpose": "",
      "verificationMethod": "",
      "created": "",
      "proofValue": "",
      "cryptosuite": ""
    }
  ],
  "credentialSchema": [
    {
      "id": "",
      "type": "1EdTechJsonSchemaValidator2019"
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
