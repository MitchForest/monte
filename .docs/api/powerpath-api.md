# PowerPath API

> Version: 1.0.0
> Generated from: https://api.alpha-1edtech.com/powerpath/openapi.yaml
> Generated on: 2025-09-18T21:59:12.631Z

## Description

TimeBack PowerPath 100 API

# Authentication

All endpoints require authentication using the `Authorization: Bearer <token>` header.

The token can be obtained with:

```
curl -X POST https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com/oauth2/token \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "grant_type=client_credentials&client_id=<your-client-id>&client_secret=<your-client-secret>"
```

Use the correct IDP server depending on the environment you're using:

- Production Server:
  https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com
- Staging Server:
  https://alpha-auth-development-idp.auth.us-west-2.amazoncognito.com

Reach out to the platform team to get a client/secret pair for your application.

# Pagination

Our API uses offset pagination for list endpoints. Paginated responses include the following fields:

- `offset`: Offset for the next page of results
- `limit`: Number of items per page (default: 100, maximum: 3000)

**Note:** While the OneRoster specification does not define a maximum limit, this implementation enforces a maximum of 3000 items per page to prevent abuse and ensure optimal performance.

Example request:

```
GET /ims/oneroster/rostering/v1p2/users?offset=20&limit=20
```

All listing endpoints support offset pagination.

# Filtering

All listing endpoints support filtering using the `filter` query parameter, following 1EdTech's filtering specification.

The filter should be a string with the following format:

```
?filter=[field][operator][value]
```

Example request:

```
GET /ims/oneroster/rostering/v1p2/users?filter=status='active'
```

Example request with multiple filters:

```
GET /ims/oneroster/rostering/v1p2/users?filter=status='active' AND name='John'
```

**Filtering by nested relations is not supported**.

# Sorting

All listing endpoints support sorting using the `sort` and `orderBy` query parameters, following 1EdTech's sorting specification

Example request:

```
GET /ims/oneroster/rostering/v1p2/users?sort=lastName&orderBy=asc
```

# Proprietary Extensions

This implementation includes proprietary extensions that extend beyond the official OneRoster 1.2 specification to provide additional functionality.

## Search Parameter

In addition to the standard `filter` parameter, this implementation provides a `search` query parameter for simplified free-text searching:

```
GET /ims/oneroster/rostering/v1p2/users?search=john
```

**Purpose**: The `search` parameter enables convenient text-based queries across multiple fields simultaneously, whereas the standard `filter` parameter requires specifying exact field names and operators:

```
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

- https://api.alpha-1edtech.com - PowerPath API

## Endpoints

### POST /powerpath/createExternalPlacementTest

**Summary:** Create an External Placement Test


Creates or updates a ComponentResource to act as a Placement Test lesson in a course.
This allows integrating with external test-taking platforms (like Edulastic) for content delivery.

The endpoint creates or updates (if they already exist) the following entities:
- A CourseComponent for the course to hold the Placement Test lesson
- A Resource with lessonType = "placement" and the external service details as metadata
- A ComponentResource acting as the Placement Test lesson

A test assignment is mandatory in order to obtain access credentials for this test on the external platform, as well as to obtain the IDs necessary for fetching test results later on:
- For test assignments, use the "makeExternalTestAssignment" endpoint.
- For test results retrieval, use the "importExternalTestAssignmentResults" endpoint.

If a 'courseIdOnFail' parameter is supplied, its Course's sourcedId will be used to automatically enroll the student when the placement test is completed with a score below 90 %. When the parameter is omitted (or set to null), no automatic enrollment will happen.

This request fails if:
- The 'course' provided does not exist, or a non-null 'courseIdOnFail' references a non-existent course
- An existing Placement Test lesson in the course, targeting the same grade, has a different toolProvider than the one provided (need to perform an update to the Resource first, altering the "toolProvider", before trying again)

A 'Lesson' in this context is a ComponentResource object which has a Resource object with lessonType = "placement" associated with it.


**Tags:** PowerPath - Course Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/createExternalTestOut

**Summary:** Create an External TestOut


Creates or updates a ComponentResource to act as a TestOut lesson in a course.
This allows integrating with external test-taking platforms (like Edulastic) for content delivery.

The endpoint creates or updates (if they already exist) the following entities:
- A CourseComponent for the course to hold the TestOut lesson
- A Resource with lessonType = "test-out" and the external service details as metadata
- A ComponentResource acting as the TestOut lesson

A test assignment is mandatory in order to obtain access credentials for this test on the external platform, as well as to obtain the IDs necessary for fetching test results later on:
- For test assignments, use the "makeExternalTestAssignment" endpoint.
- For test results retrieval, use the "importExternalTestAssignmentResults" endpoint.

This request fails if:
- The course provided does not exist
- An existing TestOut lesson in the course has a different toolProvider than the one provided (need to perform an update to the Resource first, altering the "toolProvider", before trying again)

A 'Lesson' in this context is a ComponentResource object which has a Resource object with lessonType = "test-out" associated with it.


**Tags:** PowerPath - Course Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/createInternalTest

**Summary:** Create an Internal Test


Creates or updates a ComponentResource to act as an internal test lesson in a course.
This allows creating tests using internal QTI resources or assessment banks with multiple QTI resources.

The endpoint creates or updates (if they already exist) the following entities:
- A CourseComponent for the course to hold the test lesson
- One or more Resources with type = "qti" for individual tests, or type = "assessment-bank" for test banks
- A ComponentResource acting as the test lesson

Supports two test types:
- Regular QTI test: Creates a single QTI resource
- Assessment Bank: Creates multiple QTI resources and wraps them in an assessment bank

For test-out and placement lessons, this will update existing tests of the same type.
For other lesson types (quiz, unit-test, pp-100), it will create new lessons in the course structure.

A 'Lesson' in this context is a ComponentResource object which has a Resource object associated with it.


**Tags:** PowerPath - Course Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/createNewAttempt

**Summary:** Create new attempt


Creates a new attempt for a student in a lesson if the current attempt is completed.

For Assessment Bank lessons:
- This will also update the state for the student, creating a new entry to associate the new attempt number with a different sub-resource of the test bank.
- If the lesson is taken again by the student, a different test may be served, considering the new resource it points to configures a different test.
- The sub-test is determined using round-robin logic over the sub-resources of the lesson's Assessment Bank Resource object.
  - So for example, if a lesson configures 2 sub-tests, the first attempt serves test 1, the second attempt serves test 2, the third attempt serves test 1 again, and so on.

A 'Lesson' in this context is a ComponentResource object which has a Resource object associated with it.


**Tags:** PowerPath - Lesson Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/finalStudentAssessmentResponse

**Summary:** Finalize a test assessments


Finalize a lesson of type `quiz`, `test-out`, or `placement` after all questions have been answered:
- Evaluates answered questions, attribute scores for each question, and overall lesson score.
- Checks the correctness of the response using the QTI question's `<qti-response-declaration>` element and update the score accordingly.
- Creates/updates the AssessmentLineItem and AssessmentResult objects for the student/question pair if it doesn't exist yet.

Not supported for external test lessons as the 3rd party tool is responsible for finalizing the test. Use the **importExternalTestAssignmentResults** endpoint instead.

Notice this may perform a course enrollment for the student if the lesson is a placement test or test-out, and the respective subject and grade are mapped to the Subject Track with a valid course set. 

A 'Lesson' in this context is a ComponentResource object which has a Resource object with metadata.lessonType = "quiz", "test-out", or "placement" associated with it.


**Tags:** PowerPath - Lesson Mastery, PowerPath - Course Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/getAssessmentProgress

**Summary:** Get assessment progress


Returns the progress the student has made in the given PowerPath lesson.

A 'Lesson' in this context is a ComponentResource object paired with a Resource object representing an activity.


**Tags:** PowerPath - Lesson Mastery, PowerPath - Course Mastery

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student who is answering the question |
| lesson | query | ✓ | string | The sourcedId of the lesson (ComponentResource) |
| attempt | query |  | string | The attempt number of the lesson that the student is answering |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/getAttempts

**Summary:** Get all attempts


Returns a list of all attempts for a student in a lesson

For Assessment Bank lessons, each attempt may represent a different sub test of the bank. Review results with care.

A 'Lesson' in this context is a ComponentResource object which has a Resource object associated with it.


**Tags:** PowerPath - Lesson Mastery

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student |
| lesson | query | ✓ | string | The sourcedId of the lesson (ComponentResource) |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/getNextQuestion

**Summary:** Get next question


Returns the next question in the given PowerPath component resource.

Works only with lessons of type 'powerpath-100'.

A 'Lesson' in this context is a ComponentResource object which has a Resource object associated with it.


**Tags:** PowerPath - Lesson Mastery

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student who is answering the question |
| lesson | query | ✓ | string | The sourcedId of the lesson (ComponentResource) |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/importExternalTestAssignmentResults

**Summary:** Import external test assignment results


Retrieves and stores the results of the external test assignment:
- Applies to 'test-out', 'placement', and 'unit-test' lessons.

This logic changes depending on the stored "toolProvider" of the lesson:
- For "edulastic":
  - If the lesson is already finalized, no data import is performed.
  - If the lesson is not finalized, this will start populating the test and question results with available data, including question scores and feedback. The test will then be deemed finalized when all questions have been answered and the test grade is "GRADED".
- For "mastery-track":
  - If the lesson is already finalized, no data import is performed.
  - If the lesson is not finalized and powerpath detects the write-back of results was done, this will process the available test and question results data, including question scores and feedback. The test will then be deemed finalized when the scoreStatus is "fully graded" and the masteryTrackProcessed flag is set to 'true'.

Will fail if:
- The lesson is not an external "test-out", "placement", or "unit-test", or the student does not exist
- Credentials for data consumption are not available in the test result of this student (meaning a previous test assignment was not made)
- Any other problem on the Edulastic or MasteryTrack API being used that may happen

The actual test results can be retrieved by using the "getAssessmentProgress" endpoint.

Notice this may perform a course enrollment for the student if the lesson is a placement test or test-out, and the respective subject and grade are mapped to the Subject Track with a valid course set. The enrollemnt can be skipped by setting the "skipCourseEnrollment" flag in the makeExternalTestAssignment request.

A 'Lesson' in this context is a ComponentResource object which has a Resource object with lessonType = "test-out", "placement", or "unit-test" associated with it.


**Tags:** PowerPath - Course Mastery

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student |
| lesson | query | ✓ | string | The sourcedId of the lesson (ComponentResource) |
| applicationName | query |  | string | The name of the application |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/lessonPlans/

**Summary:** Create a lesson plan

Purpose: Create a new lesson plan for a course and student

When to use:
- When a new student is enrolled in a course
- For initial setup of a student's learning path
- When you need to create a lesson plan from scratch

What it does:
- Creates a new lesson plan
- Associates it with the course and student
- Optionally, associates it with a class
- Returns the lesson plan ID
- If the lesson plan already exists, returns the existing lesson plan ID
- If the course, user or class is not found, returns a 404 error
    

**Tags:** PowerPath - Lesson Plans

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Lesson plan already exists
- **201**: Lesson plan created
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Course, User or Class not found

---

### GET /powerpath/lessonPlans/{courseId}/{userId}

**Summary:** Returns the lesson plan tree for a course and student


Given a course sourced ID and a user sourced ID, returns the lesson plan tree.

The lesson plan tree is nested object comprised of several lessonPlanItems, 
which are nodes that contain information about the lesson plan - including which component or component resource is associated with that node, 
as well as which node is its parent.

A node may reference a component or a componentResource.
A node with no parent is considered at the root level of the lesson plan tree.

A student's lesson plan has a unique ID that can be used instead of the parameters to retrieve it.
    

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| courseId | path | ✓ | string | Course Sourced ID |
| userId | path | ✓ | string | User Sourced ID |

#### Responses

- **200**: No description
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Lesson Plan not found

---

### DELETE /powerpath/lessonPlans/{courseId}/deleteAll

**Summary:** Delete all lesson plans for a course


    Deletes all lesson plans for a course by its ID.
    

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| courseId | path | ✓ | string | Course ID |

#### Responses

- **204**: Lesson Plans deleted
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Course not found

---

### POST /powerpath/lessonPlans/{lessonPlanId}/operations

**Summary:** Store an operation on a lesson plan

Purpose: Store a new operation in the lesson plan's operation log

When to use:
- Primary endpoint for all lesson plan modifications
- When students, guides or admins want to customize the learning path
- For any personalization changes

Available Operations:

- set-skipped: Show/hide content for the student
- move-item-before/after: Reorder content relative to other items
- move-item-to-start/end: Move to beginning/end of parent
- add-custom-resource: Add additional resources in the lesson plan
- change-item-parent: Move content to different sections (components) in the lesson plan

  

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| lessonPlanId | path | ✓ | string | Lesson plan ID |

#### Request Body

**Content-Type:** application/json

#### Responses

- **201**: Operation stored
- **401**: Unauthorized
- **403**: Forbidden

---

### GET /powerpath/lessonPlans/{lessonPlanId}/operations

**Summary:** Get the operations for a lesson plan

Purpose: Get all operations for a lesson plan

When to use:
- For audit trails and history tracking
- When debugging lesson plan issues
- For administrative oversight

What it does:
- Returns all operations in chronological order
- Includes operation type, payload, timestamp, and reason
- Shows who made each change and when
  

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| lessonPlanId | path | ✓ | string | Lesson plan ID |

#### Responses

- **200**: Operations
- **401**: Unauthorized
- **403**: Forbidden

---

### POST /powerpath/lessonPlans/{lessonPlanId}/operations/sync

**Summary:** Sync the operations for a lesson plan

Purpose: Apply pending operations to update the lesson plan

When to use:
- After storing operations, to see the changes take effect
- For incremental updates without full recreation
- When you want to apply only recent changes (e.g after running a script to add a lot of operations)

What it does:
- Finds operations that haven't been applied yet
- Executes them in sequence
- Updates the lesson plan structure
- Returns results of each operation
  

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| lessonPlanId | path | ✓ | string | Lesson plan ID |

#### Responses

- **200**: Operations synced
- **401**: Unauthorized
- **403**: Forbidden

---

### POST /powerpath/lessonPlans/{lessonPlanId}/recreate

**Summary:** Recreate a lesson plan from a course and apply all operations

Purpose: Recreate a lesson plan from scratch using it's operation log

When to use:
- When a lesson plan becomes corrupted or out of sync
- For testing or debugging purposes
- After detecting and correcting inconsistencies

What it does:
- Deletes all current lesson plan items
- Rebuilds from the base course structure
- Applies all operations from the operation log in sequence
- Returns the operation results for monitoring and inspection


**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| lessonPlanId | path | ✓ | string | Lesson plan ID |

#### Responses

- **200**: Lesson plan recreated
- **401**: Unauthorized
- **403**: Forbidden

---

### POST /powerpath/lessonPlans/course/{courseId}/sync

**Summary:** Sync Lesson Plans for a Course

Purpose: Bulk synchronization of all lesson plans for a course.

When to use:
- After making significant structural changes to a base course
- When you need to ensure all students have the latest course content

What it does:

- Finds all lesson plans associated with the course
- Recreates each lesson plan from the base course structure
- Applies all historical operations to maintain personalizations
- Return a list of affected lesson plan ID's 

  

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| courseId | path | ✓ | string | Course ID |

#### Responses

- **200**: Course synced
- **401**: Unauthorized
- **403**: Forbidden

---

### GET /powerpath/lessonPlans/getCourseProgress/{courseId}/student/{studentId}

**Summary:** Get course progress


Get the course progress for a student in a course.

---

Returns a list of **assessment line items** for the **course** and **student**.

A type "**component**" indicates a component of the lesson plan such as a unit or lesson.

A type "**resource**" indicates a resource such as a video, audio,
or document file as well as a quiz or question.

Each **line item** contains a list of assessment results in the **results** attribute, related to student and course.

**Filtering by Lesson**

You can optionally filter the results to only include line items for a specific lesson by providing the `lessonId` query parameter with the component resource ID.
    

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| courseId | path | ✓ | string | Course ID |
| studentId | path | ✓ | string | Student ID |
| lessonId | query |  | string | Optional component resource ID to filter results by a specific lesson |

#### Responses

- **200**: Course progress
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/lessonPlans/tree/{lessonPlanId}

**Summary:** Get a lesson plan tree by its ID

Purpose: Get the complete lesson plan tree for a lesson plan.

When to use:
- When you need to display the full lesson plan to a student
- For rendering the personalized learning path

What it does:
- Returns the lesson plan in a syllabus-like format
- Includes only non-skipped items (visible content)
- Shows the hierarchical structure with components and resources
- Provides all original metadata needed for UI rendering
  

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| lessonPlanId | path | ✓ | string | Lesson plan ID |

#### Responses

- **200**: Lesson plan tree
- **401**: Unauthorized
- **403**: Forbidden

---

### GET /powerpath/lessonPlans/tree/{lessonPlanId}/structure

**Summary:** Get a lesson plan tree structure by its ID

Purpose: Get a simplified structure for inspection and debugging.

When to use:
- For administractive tools and debugging
- When you need to see the internal lesson plan structure without the full metadata

What it does:
- Returns a lightweight view of the lesson plan structure
- Shows both skipped and non-skipped items
- Includes order information and component/resource IDs (alos includes item ids but these should'n be relied on since they are not stable)
- Useful for understanding the current state
  

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| lessonPlanId | path | ✓ | string | Lesson plan ID |

#### Responses

- **200**: Lesson plan tree structure
- **401**: Unauthorized
- **403**: Forbidden

---

### POST /powerpath/lessonPlans/updateStudentItemResponse

**Summary:** Update student item response


Update the student item response for a student in a course.

---

The item may be a **component** or **componentResource**.

You should provide either the **componentId** or the **componentResourceId**.

If you provide the **componentId**, the data in the response payload should be in relation to the student's response to the entire component.

If you provide the **componentResourceId**, the data in the response payload should be in relation to the student's response to the specific resource.
    

**Tags:** PowerPath - Lesson Plans

#### Request Body

**Content-Type:** application/json

#### Responses

- **201**: Student item response updated
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/makeExternalTestAssignment

**Summary:** Make external test assignment


Makes an external test assignment for the given student:
- Applies to 'test-out', 'placement', and 'unit-test' lessons.

This logic changes depending on the provided "toolProvider" value:
- For "edulastic":
  - Authenticates the student with their email on Edulastic
  - Assigns the test to the student in Edulastic
  - Stores the received "assignmentId" and "classId" in the lesson's AssessmentResult
  - Returns the test link, credentials, and IDs of the test for later results consumption
- For "mastery-track":
  - Authenticates the student with their email on MasteryTrack
  - Assigns the test to the student in MasteryTrack (using the testId in the request or subject+grade from the lesson's Resource metadata)
  - Stores the received "assignmentId" in the lesson's AssessmentResult
  - Returns the test link, credentials, and IDs of the test
  - Waits for a test result write-back to be performed by the MasteryTrack on test end

Will fail if:
- The lesson is not an external "test-out", "placement", or "unit-test", or the student does not exist
- External tool (described in the resource.metadata.toolProvider) is not "edulastic" or "mastery-track"
- Any other problem on the Edulastic or MasteryTrack API being used that may happen

A 'Lesson' in this context is a ComponentResource object which has a Resource object with lessonType = "test-out", "placement", or "unit-test" associated with it.


**Tags:** PowerPath - Course Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/placement/getAllPlacementTests

**Summary:** Get all placement tests


Returns all placement tests for a subject, including available results for each.

A 'Lesson' (placement test) in this context is a ComponentResource object which has a Resource object with metadata.lessonType = "placement" associated with it.


**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student |
| subject | query | ✓ | string | The subject name |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/placement/getCurrentLevel

**Summary:** Get current level


Returns the current level of the student in a placement process:
- The level is determined by the last completed placement test's grade level, starting from the lowest grade level available for the subject's placement tests.
- As the student completes placement tests and attains scores of 90 or greater, their level updates to the next level available for the subject.

Also returns the 'onboarded' boolean that indicates if the student completed the onboarding process for the subject:
- A 'onboarded = true' means they either completed and passed all placement tests or they have gotten a score smaller than 90 in the last completed placement test.
- A 'onboarded = false' means they haven't completed placement tests yet or have achieved a score of 90 or greater in the last completed placement test and there are more tests to take.


**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student |
| subject | query | ✓ | string | The subject name |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/placement/getNextPlacementTest

**Summary:** Get next placement test


Returns the next placement test for the student in a subject:
- If the student has completed all placement tests for the subject, the next test's lesson ID will be null. Tests will also be marked as exhausted.
- If the student hasn't completed a single placement test, returns the first placement test's lesson ID for the subject.
- If the student has completed some placement tests, it will return null for the next test's lesson ID if the last completed test had a score smaller than 90.
- Alternatively, it will return the next available placement test's lesson ID if the score was greater than or equal to 90.

Also returns the 'onboarded' boolean that indicates if the student completed the onboarding process for the subject:
- A 'onboarded = true' means they either completed and passed all placement tests or they have gotten a score smaller than 90 in the last completed placement test.
- A 'onboarded = false' means they haven't completed placement tests yet or have achieved a score of 90 or greater in the last completed placement test and there are more tests to take.

A 'Lesson' in this context is a ComponentResource object which has a Resource object with metadata.lessonType = "placement" associated with it.


**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student |
| subject | query | ✓ | string | The subject name |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/placement/getSubjectProgress

**Summary:** Get subject progress


Returns the progress the student has made in the given subject


**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student |
| subject | query | ✓ | string | The subject name |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/placement/resetUserPlacement

**Summary:** Reset user placement for subject


Resets a user's placement progress for a specific subject by:
- Soft deleting all placement assessment results for that subject
- Resetting user onboarding state to "in_progress" and removing completedAt and courseId if existing

This operation is restricted to administrators only and cannot be undone.


**Tags:** PowerPath - Placement

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: User not found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/resetAttempt

**Summary:** Reset attempt


Resets the attempt for the given PowerPath lesson of a student:
- Soft-deletes all previous question responses, resets the test score to 0, and updates its 'scoreStatus' to "not submitted".
- If the lesson is an external test, only resets the test score to 0.

For Assessment Bank lessons, this will keep the user state in the same bank test for the current attempt.

A 'Lesson' in this context is a ComponentResource object which has a Resource object associated with it.


**Tags:** PowerPath - Lesson Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/screening/results/{userId}

**Summary:** Get results

Get results for a user

**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| userId | path | ✓ | string | User ID |

#### Responses

- **200**: Results
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/screening/session/{userId}

**Summary:** Get session

Get session for a user

**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| userId | path | ✓ | string | User ID |

#### Responses

- **200**: Session
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/screening/session/reset

**Summary:** Reset session

Reset session for a user

**Tags:** PowerPath - Placement

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| userId | path | ✓ | string | User ID |

#### Request Body

**Content-Type:** application/json

#### Responses

- **204**: Session reset
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/screening/tests/assign

**Summary:** Assign test

Assign test to a user

**Tags:** PowerPath - Placement

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Test assigned
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/syllabus/{courseSourcedId}

**Summary:** Get course syllabus

Get course syllabus

**Tags:** PowerPath - Lesson Plans

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| courseSourcedId | path | ✓ | string | The course sourcedId |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### POST /powerpath/test-assignments

**Summary:** Create an individual test assignment (unlisted test-out)

Creates a standalone test-out assignment for a student, generating a Resource and an unlisted ComponentResource (no course link), and registering the assignment record.

**Tags:** PowerPath - Test Assignments

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/test-assignments

**Summary:** List test assignments for a student

Returns a paginated list of test assignments filtered by student with optional filters for status, subject, and grade.

**Tags:** PowerPath - Test Assignments

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| limit | query |  | integer | The maximum number of items to return in the paginated response. While the OneRoster specification does not define a maximum limit, this implementation enforces a maximum of 3000 to prevent abuse and ensure optimal performance. |
| offset | query |  | integer | The number of items to skip in the paginated response |
| student | query | ✓ | string | The sourcedId of the student |
| status | query |  | string |  |
| subject | query |  | string |  |
| grade | query |  | string |  |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### DELETE /powerpath/test-assignments/{id}

**Summary:** Delete a test assignment

Soft deletes a test assignment by ID.

**Tags:** PowerPath - Test Assignments

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| id | path | ✓ | string | Test assignment sourcedId |

#### Responses

- **204**: Deleted
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### PUT /powerpath/test-assignments/{id}

**Summary:** Update a test assignment

Updates the title of a test assignment.

**Tags:** PowerPath - Test Assignments

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| id | path | ✓ | string | Test assignment sourcedId |

#### Request Body

**Content-Type:** application/json

#### Responses

- **204**: Updated
- **400**: Invalid payload
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/test-assignments/{id}

**Summary:** Get a test assignment

Returns a single test assignment by its ID.

**Tags:** PowerPath - Test Assignments

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| id | path | ✓ | string | Test assignment sourcedId |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/test-assignments/admin

**Summary:** List all test assignments (admin)

Returns a paginated list of test assignments across students. Optional filters for student, status, subject, grade.

**Tags:** PowerPath - Test Assignments

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| limit | query |  | integer | The maximum number of items to return in the paginated response. While the OneRoster specification does not define a maximum limit, this implementation enforces a maximum of 3000 to prevent abuse and ensure optimal performance. |
| offset | query |  | integer | The number of items to skip in the paginated response |
| student | query |  | string |  |
| status | query |  | string |  |
| subject | query |  | string |  |
| grade | query |  | string |  |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### GET /powerpath/testOut

**Summary:** Test out


Returns the testOut lesson reference for the given student and course.

- TestOut is a lesson that represents the end-of-course test, covering the entire course content.
- The testOut should be specified by a Resource with metadata.lessonType = "test-out".

Details:
- Returns a null lessonId in case no Resource with metadata.lessonType = "test-out" is found in the course.
- In case student has already taken the TestOut, this will return the "finalized" flag set to true.
- In case this is an external TestOut, also return external access credentials, if available (i.e. test was previously assigned to student).

A 'Lesson' in this context is a ComponentResource object which has a Resource object with metadata.lessonType = "test-out" associated with it.


**Tags:** PowerPath - Course Mastery

#### Parameters

| Name | In | Required | Type | Description |
|------|-----|----------|------|-------------|
| student | query | ✓ | string | The sourcedId of the student to retrieve the testOut for |
| course | query | ✓ | string | The sourcedId of the Course to retrieve the testOut from |

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

### PUT /powerpath/updateStudentQuestionResponse

**Summary:** Update student question response


Updates the student's response to a question and returns the updated PowerPath score:
- Checks the correctness of the response using the QTI question `<qti-response-declaration>` element and update the score accordingly.
- Creates/updates the AssessmentLineItem and AssessmentResult objects for the student/question pair if it doesn't exist yet.

A 'Lesson' in this context is a ComponentResource object which has a Resource object associated with it.


**Tags:** PowerPath - Lesson Mastery, PowerPath - Course Mastery

#### Request Body

**Content-Type:** application/json

#### Responses

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity / Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

## Schemas

### AddCustomResourceCommand

Add a custom resource to the lesson plan under a component, by default the resource is placed at the end of the component

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### AssessmentLineItem

Represents an assessment line item.

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| sourcedId | string |  |  |
| status | string | ✓ |  |
| dateLastModified | string |  |  |
| metadata | object |  | Additional metadata for the object |
| title | string | ✓ |  |
| description | string,null |  |  |
| class | object,null |  |  |
| parentAssessmentLineItem | object,null |  | Represents a parent assessment line item. |
| scoreScale | object,null |  | Represents a score scale. |
| resultValueMin | number,null |  |  |
| resultValueMax | number,null |  |  |
| component | object,null |  | PROPRIETARY EXTENSION: Reference to the Component that this assessment line item is associated with. Enables enhanced curriculum mapping. |
| componentResource | object,null |  | PROPRIETARY EXTENSION: Reference to the Component Resource that this assessment line item is associated with. Supports detailed content-to-assessment relationships. |
| learningObjectiveSet | any |  |  |
| course | object,null |  | PROPRIETARY EXTENSION: Reference to the Course that this assessment line item is associated with. |

### AssessmentResult

Represents an assessment result.

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| sourcedId | string |  |  |
| status | string | ✓ |  |
| dateLastModified | string |  |  |
| metadata | object |  | Additional metadata for the object |
| assessmentLineItem | object | ✓ |  |
| student | object | ✓ |  |
| score | number,null |  |  |
| textScore | string,null |  |  |
| scoreDate | string | ✓ |  |
| scoreScale | object,null |  |  |
| scorePercentile | number,null |  |  |
| scoreStatus | string | ✓ |  |
| comment | string,null |  |  |
| learningObjectiveSet | array,null |  |  |
| inProgress | string,null |  |  |
| incomplete | string,null |  |  |
| late | string,null |  |  |
| missing | string,null |  |  |

### BadRequestResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### ChangeItemParentCommand

Change the parent of a lesson plan item, by default the item is placed at the end of the parent

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### CreateExternalPlacementInput

Input for creating an external placement test

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| courseId | string | ✓ | The sourcedId of the Course to create the external test for |
| lessonTitle | string |  | The title of the external test reference |
| launchUrl | string |  | The URL to the external test system (e.g., Edulastic, QTI, etc.) |
| toolProvider | string | ✓ | The type of external service (e.g.: 'edulastic') |
| unitTitle | string |  | The title of the unit containing the external test |
| courseComponentSourcedId | string |  | The sourcedId of an existing CourseComponent (unit) for the test. If not provided, a new unit will be created. |
| vendorId | string |  | The ID of the test in the spreadsheet |
| description | string |  | Description of the external test that will be added to the Resource entity's metadata |
| resourceMetadata | null |  | Additional metadata for the external test resource |
| grades | array | ✓ | The grades for the resource |
| lessonType | string | ✓ |  |
| courseIdOnFail | string,null |  | The courseId to enroll the student in if they fail the placement test (optional) |
| xp | number |  | The XP value for the resource |

### CreateExternalTestOutInput

Input for creating an external test-out lesson

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| courseId | string | ✓ | The sourcedId of the Course to create the external test for |
| lessonTitle | string |  | The title of the external test reference |
| launchUrl | string |  | The URL to the external test system (e.g., Edulastic, QTI, etc.) |
| toolProvider | string | ✓ | The type of external service (e.g.: 'edulastic') |
| unitTitle | string |  | The title of the unit containing the external test |
| courseComponentSourcedId | string |  | The sourcedId of an existing CourseComponent (unit) for the test. If not provided, a new unit will be created. |
| vendorId | string |  | The ID of the test in the spreadsheet |
| description | string |  | Description of the external test that will be added to the Resource entity's metadata |
| resourceMetadata | null |  | Additional metadata for the external test resource |
| grades | array | ✓ | The grades for the resource |
| lessonType | string | ✓ |  |
| xp | number | ✓ | The XP value for the resource |

### CreateInternalAssessmentBankInput

Input for creating an internal assessment bank test

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| courseId | string | ✓ | The sourcedId of the Course to create the internal test for |
| lessonType | string | ✓ | The type of lesson to create |
| lessonTitle | string |  | Optional title for the lesson (ComponentResource) |
| unitTitle | string |  | Optional title for the unit (CourseComponent) |
| courseComponentSourcedId | string |  | Optional sourcedId of existing CourseComponent to reuse |
| resourceMetadata | null |  | Additional metadata for the internal test resource |
| xp | number |  | The XP value for the resource (for test-out lessons) |
| grades | array |  | The grades for the resource (for placement tests) |
| courseIdOnFail | string,null |  | The courseId to enroll the student in if they fail the placement test (optional) |
| testType | string | ✓ |  |
| assessmentBank | object | ✓ |  |

### CreateInternalQtiTestInput

Input for creating an internal QTI test

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| courseId | string | ✓ | The sourcedId of the Course to create the internal test for |
| lessonType | string | ✓ | The type of lesson to create |
| lessonTitle | string |  | Optional title for the lesson (ComponentResource) |
| unitTitle | string |  | Optional title for the unit (CourseComponent) |
| courseComponentSourcedId | string |  | Optional sourcedId of existing CourseComponent to reuse |
| resourceMetadata | null |  | Additional metadata for the internal test resource |
| xp | number |  | The XP value for the resource (for test-out lessons) |
| grades | array |  | The grades for the resource (for placement tests) |
| courseIdOnFail | string,null |  | The courseId to enroll the student in if they fail the placement test (optional) |
| testType | string | ✓ |  |
| qti | object | ✓ |  |

### ForbiddenResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### GradeEnum

Grade levels. -1 is Pre-K, 0 is Kindergarten, 1-12 are grades 1-12, 13 is AP.

**Type:** string

**Enum values:**
- -1
- 0
- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10
- 11
- 12
- 13

### InternalServerErrorResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### LearningObjectiveSet

Represents a learning objective set.

**Type:** array,null

### LessonPlanStructureNode

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| componentResourceId | string |  |  |
| componentId | string |  |  |
| type | string | ✓ |  |
| title | string | ✓ |  |
| order | string | ✓ |  |
| skipped | boolean | ✓ |  |
| itemId | string | ✓ |  |
| componentResources | array |  |  |
| subComponents | array |  |  |

### LessonPlanTreeComponent

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | The ID of the lesson plan item |
| sourcedId | string | ✓ | The Sourced ID of the component |
| status | string | ✓ |  |
| title | string | ✓ |  |
| sortOrder | string |  |  |
| unlockDate | string |  |  |
| metadata | object |  |  |
| prerequisites | array |  |  |
| prerequisiteCriteria | string |  |  |
| componentResources | array |  |  |
| subComponents | array |  |  |

### MoveItemAfterCommand

Move a lesson plan item to be after another item

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### MoveItemBeforeCommand

Move a lesson plan item to be before another item

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### MoveItemToEndCommand

Move a lesson plan item to the end of the parent

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### MoveItemToStartCommand

Move a lesson plan item to the start of the parent

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### NotFoundResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### PlacementUpdateStudentQuestionResponseResult

Represents the result of updating the student's response to the question in the PowerPath Placement test

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| questionResult | any |  | The assessment result object for the question (for debugging) |
| lessonType | string | ✓ |  |

### PowerPath100ProgressResult

Represents the progress of the student in the PowerPath100 lesson

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| lessonType | string | ✓ |  |
| remainingQuestionsPerDifficulty | object | ✓ |  |
| score | number | ✓ | The current score for this attempt |
| seenQuestions | array | ✓ |  |
| attempt | number | ✓ | The attempt number |
| xp | number,null | ✓ | The XP the student has earned in the lesson |
| multiplier | number,null | ✓ | The multiplier for the student's XP |
| accuracy | number | ✓ | The accuracy of the student's attempted questions |
| correctQuestions | number | ✓ | The number of correct questions the student has answered in the lesson |
| totalQuestions | number | ✓ | The total number of questions in the lesson |

### PowerPath100UpdateStudentQuestionResponseResult

Represents the result of updating the student's response to the question in the PowerPath100 lesson (ComponentResource)

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| lessonType | string | ✓ |  |
| powerpathScore | number | ✓ | The updated PowerPath score of the student in this lesson |
| responseResult | object | ✓ | The result of processing the student's response |
| questionResult | any |  | The assessment result object for the question (for debugging) |
| testResult | any |  | The assessment result object for the test (for debugging) |
| accuracy | number | ✓ | The accuracy of the student's attempted questions |
| correctQuestions | number | ✓ | The number of correct questions the student has answered in the lesson |
| totalQuestions | number | ✓ | The total number of questions in the lesson |
| xp | number,null | ✓ | The XP the student has earned in the lesson |
| multiplier | number,null | ✓ | The multiplier for the student's XP |

### PowerPathTestQuestion

A PowerPath Test Question

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | The ID that represents the question in the test |
| index | number | ✓ | The index of the question in the test |
| title | string | ✓ | The title of the question |
| url | string | ✓ | The URL of the QTI question |
| difficulty | string | ✓ | The difficulty of the question |
| humanApproved | boolean,null |  | Whether the question has been approved by a human |
| content | object |  | The QTI content of the question |
| response | any |  | The student's response to the question |
| responses | object |  | The student's responses to the question |
| correct | boolean |  | Whether the student's response is correct |
| result | object |  | The result of the question |
| learningObjectives | array |  | Array of learning objective IDs associated with the question |

### QuizUpdateStudentQuestionResponseResult

Represents the result of updating the student's response to the question in the PowerPath Quiz lesson

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| questionResult | any |  | The assessment result object for the question (for debugging) |
| lessonType | string | ✓ |  |

### Resource

Represents a digital resource of some kind.

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| sourcedId | string | ✓ |  |
| status | string | ✓ |  |
| dateLastModified | string |  |  |
| metadata | object |  | Additional metadata for the object |
| title | string | ✓ |  |
| roles | array |  |  |
| importance | string |  |  |
| vendorResourceId | string | ✓ |  |
| vendorId | string,null |  |  |
| applicationId | string,null |  |  |

### SetSkippedCommand

Set the skipped attribute of a lesson plan item, effectively changing it's visibility for the student

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | ✓ |  |
| payload | object | ✓ |  |

### SubjectEnum

**Type:** string

**Enum values:**
- Reading
- Language
- Vocabulary
- Social Studies
- Writing
- Science
- FastMath
- Math

### TestOutResult

Holds the id of the TestOut lesson (ComponentResource), or its results in case it was previously attempted

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| lessonType | string | ✓ |  |
| lessonId | string,null | ✓ | The id of the testOut lesson |
| finalized | boolean | ✓ | Whether the Test Out has been finalized in the current attempt |
| toolProvider | string,null | ✓ | The tool provider for the testOut lesson |
| attempt | number |  | The attempt number |
| credentials | object |  | The credentials for accessing the assigned test on external tool |
| assignmentId | string |  | The id of the assignment on external tool for results retrieval |
| classId | string |  | The id of the class on external tool for results retrieval (may be empty for some tools) |
| testUrl | string |  | The URL of the test on external tool |
| testId | string |  | The id of the test on external tool (may be assignment ID for some tools) |

### TestOutUpdateStudentQuestionResponseResult

Represents the result of updating the student's response to the question in the PowerPath Test Out lesson

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| questionResult | any |  | The assessment result object for the question (for debugging) |
| lessonType | string | ✓ |  |

### TooManyRequestsResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### UnauthorizedRequestResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### UnitTestUpdateStudentQuestionResponseResult

Represents the result of updating the student's response to the question in the PowerPath Unit Test lesson

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| questionResult | any |  | The assessment result object for the question (for debugging) |
| lessonType | string | ✓ |  |

### UnprocessableEntityResponse

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| imsx_codeMajor | string | ✓ | The major response code |
| imsx_severity | string | ✓ | The severity of the response |
| imsx_description | string | ✓ |  |
| imsx_CodeMinor | object | ✓ |  |
| imsx_error_details | array |  |  |

### UpdateStudentQuestionResponseInput

The input for the updateStudentQuestionResponse endpoint

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| student | string | ✓ | The sourcedId of the student who is answering the question |
| question | string | ✓ | The QTI question identifier from the lesson's question bank. This identifier corresponds to a specific question fetched from the QTI test URL stored in the lesson's Resource metadata. |
| response | any |  | DEPRECATED: Use 'responses' instead. / The student's response to the question. Might be the reference to the choice specified in the QTI structure. |
| responses | object |  | Object containing response identifiers as keys and their corresponding values as strings or arrays of strings |
| lesson | string | ✓ | The sourcedId of the lesson (ComponentResource) |

