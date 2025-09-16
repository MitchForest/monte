https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.0 

AUTH:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.ju8zoq28fnw#heading=h.lzypf4rxul2v

USERS AND ENROLLMENT:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.ruy5u6pb0k4e#heading=h.ha7h4rixgzas

POWER PATH:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.yagk3qqzbm8q#heading=h.2s520vsrndzn

GRADES AND PROGRESS:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.9e694bthcddc#heading=h.h25iaddm9u3n

CREATE A COURSE:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.xwf4sx98aibd#heading=h.ha7h4rixgzas

CREATE CONTENT:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.x0i3ruazwrk4#heading=h.ha7h4rixgzas

XP, ACCURACY, MASTERY:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.agh8m8eyeu1y#heading=h.ha7h4rixgzas

RENDERING QTI:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.9cgw8oan4yd8#heading=h.xas2ep65z8bu

DYNAMIC LESSON PLANS:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.5rwpwy33lp6#heading=h.df71vqvnpnyz

FRQ:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.rt7rxyd6zms6#heading=h.jq5f17qckzur

QTI CUSTOM GRADERS:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.j1wbzs7px6l6#heading=h.3idcfuacw6al

COURSE AND ENROLLMENT:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.kfnw1cexhd3k#heading=h.rsmcen5yda6d

EXAMPLE:
https://docs.google.com/document/d/1pqo0D2hpozv-OYom_-hRotLIm85S8vny2o1tUMh3wpU/edit?tab=t.h9oglen0lt4e#heading=h.j4p1fb7g7iwh

QTI
Developed to ensure consistent creation, delivery, and reporting of digital assessments. It enables interoperability between different assessment tools and learning management systems, making it easier to share, reuse, and analyze test items and assessment results across various platforms. 

Production server base URL: https://qti.alpha-1edtech.com 
Staging server base URL: https://qti-staging.alpha-1edtech.com/ 
API Documentation: https://qti.alpha-1edtech.com/scalar/ 
OpenAPI: https://qti.alpha-1edtech.com/openapi.yaml 

Specific QTI documentation: QTI API Documentation

OneRoster

Defines a common data format and set of services for securely exchanging class roster data, course details, and grade information between systems like Student Information Systems (SIS) and Learning Management Systems (LMS).

Production server base URL: https://api.alpha-1edtech.com/ 
Staging server base URL: https://api.staging.alpha-1edtech.com/ 
API Documentation: https://api.alpha-1edtech.com/scalar/ 
OpenAPI: https://api.alpha-1edtech.com/openapi.yaml 

Caliper
Learning analytics standard from the 1EdTech that provides a framework for capturing and exchanging digital learning activity data. It uses a common vocabulary and set of metric profiles to consistently record interactions across various educational tools, enabling educators and researchers to analyze engagement, compare outcomes, and drive timely interventions. 

Production server base URL: https://caliper.alpha-1edtech.com/ 
Staging server base URL: https://caliper-staging.alpha-1edtech.com/ 
API Documentation: https://caliper.alpha-1edtech.com/ 
OpenAPI: https://caliper.alpha-1edtech.com/openapi.yaml 
PowerPath
PowerPath is a convenience API layer built on top of 1EdTech (more specifically, OneRoster and QTI), that helps apps to use learning science to accelerate student's learning. Mastery learning is at the heart of PowerPath. PowerPath uses OneRoster data models behind the scenes.

Production server base URL: https://api.alpha-1edtech.com/  
Staging server base URL: https://staging.alpha-1edtech.com/  
Full API docs: https://api.alpha-1edtech.com/scalar?api=powerpath-api
OpenAPI: https://api.alpha-1edtech.com/powerpath/openapi.yaml 
CASE
A CASE framework is a hierarchically structured digital version of the static versions (PDF, Word, Excel, or HTML) of academic standards, learning objectives, or competencies documents. It is available for download and upload into platforms and applications. Each academic standard or competency gets a unique identifier called a GUID (Globally Unique Identifier) when implemented.

Production server base URL: https://api.alpha-1edtech.com/
Staging server base URL: https://staging.staging.alpha-1edtech.com/ 
API Documentation: https://api.alpha-1edtech.com/scalar?api=case-api  
OpenAPI: https://api.alpha-1edtech.com/case/openapi.yaml  

TimeBack UI
The TimeBack UI is the student-facing platform that puts some of the concepts described above into practice. However, Timeback clients need to, most of the time, build their own UI with specific needs while using Timeback APIs as backend/integration layer.

Implementation base URL: https://timeback.alpha-1edtech.com/ 
Implementation Staging base URL: https://timeback-staging.alpha-1edtech.com/ 

OpenBadge
Open Badges is a global standard for creating, issuing, and verifying digital micro-credentials that represent skills, achievements, learning outcomes, and experiences. It provides a common, interoperable language for recognizing accomplishments in a way that is portable, verifiable, and data-rich.

Production server base URL: https://api.alpha-1edtech.com/ 
Staging server base URL: https://api.staging.alpha-1edtech.com/ 
Walkthrough video: TimeBack - OpenBadge API

CLR
Comprehensive Learner Record (CLR) is a standard for creating, transmitting, and rendering an individual's full set of achievements, issued by multiple learning providers, in a machine-readable and verifiable digital format. It enables the curation of diverse learning experiences, including courses, competencies, co-curricular activities, and badges into a single, interoperable record that supports a learner's lifelong educational and career journey.

Production server base URL: https://api.alpha-1edtech.com/ 
Staging server base URL: https://api.staging.alpha-1edtech.com/ 
Walkthrough video: CLR API
