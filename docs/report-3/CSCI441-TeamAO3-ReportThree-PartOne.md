<!--
  Exported from the team Google Doc "AO3 Proposal", tab "Report 3 Part 1", on 2026-11-25
  (doc last modified 2026-11-23). Text export only: figures, diagrams and the
  Gantt chart are images in the doc and are not included here. The
  table-of-contents links point back into the Google Doc.
-->

# **CSCI 441 - Software Engineering**

# **SuperAsk.AI: AI-Powered Government Service Assistant**

Report Three, Part One

Team AO3

Yean Fong, Phallamonunhh Chun, BunKheang Heng, 

Doungkhe Neang, Heejae Choi, and Sereyprophea Sarin

Professor Hieu Vu 

  

Project URL: <https://github.com/Monunhh/Super-ask.git>

  

### 

**Table of Content**

[1. Customer Statement of Requirements 3](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.3u6vuogfg7em)

[2. Glossary of Terms 7](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.im2vcnh1of0v)

[3. System Requirements 7](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.rtum95md0wuo)

[4. Functional Requirement Specification 15](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.42ml9qtbltrf)

[5. Effort Estimation Using Use Case Points 41](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.4b8swfb6v0j5)

[6. Domain Analysis 49](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.pg0l14skjj5y)

[7. Interaction Diagrams 67](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.ga9xpbb9mqpr)

[8. System Architecture and System Design 73](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.q5e68trbl2ph)

[9. Algorithms and Data Structures 82](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.yygg4dw3zj0c)

[10. Project Management 88](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.u5hhpj9x9edu)

[11. References 97](https://docs.google.com/document/d/10MRGVjlg_tgRHiOBul8ila8mpRoyHx5LnGGiO_rHwFQ/edit#heading=h.lwqvkxvolpif)

**Individual Contributions Breakdown**

  

|  |  |
| :-: | :-: |
| \*\*Team Member\*\* | \*\*Contributions to Report Three Part One\*\* |
| Yean Fong | Updated Project Management (Section 10), including project coordination, History of Work, Current Status and Future Work, planned versus actual milestones, Gantt chart, and team responsibilities. Reviewed and integrated the report, updated the table of contents, and ensured documentation consistency. Retained Algorithms and Data Structures (Section 9) from Report Two. |
| Doungkhe Neang | Contributed to Customer Statement of Requirements (Section 1), Glossary of Terms (Section 2), government-service research, and project coordination. Assisted with reviewing documentation incorporated into Report Three Part One. |
| Sereyprophea Sarin | Prepared two traceability matrices: system requirements to use cases (Section 4) and use cases to domain concepts (Section 6). Contributed supporting explanations and reviewed Domain Analysis (Section 6) for requirements coverage and consistency. |
| Phallamonunhh Chun | Continued AI/ML engineering and system implementation, including retrieval pipeline development, AI model integration, and response reliability improvements. Contributed to previously prepared System Requirements (Section 3), Functional Requirement Specification (Section 4), and Interaction Diagrams (Section 7). |
| Bunkheang Heng | Prepared Effort Estimation Using Use Case Points (Section 5), including actor and use-case weights, Technical Complexity Factor (TCF), Environmental Complexity Factor (ECF), adjusted Use Case Points (UCP), and development effort estimation using PF = 28 hours/UCP. Reviewed System Requirements (Section 3) and Functional Requirement Specification (Section 4). Retained System Architecture and System Design (Section 8) from Report Two, including subsystem design, UML diagrams, and hardware mapping.  |
| Heejae Choi | Revised Interaction Diagrams (Section 7), incorporating design patterns and explanations of how the selected patterns improve the system design. Reviewed system sequence diagrams and their consistency with the implemented use cases. |

### **1. Customer Statement of Requirements**

**Problem Statement**

  

Scenario 1: High School Student Graduate 

  

Right after completing my BACII National Examination, I wanted to move quickly and apply for university. I went to the application site to check the required documents, applying to both national and international universities at once. Across every application, the same two documents kept coming up: my high school diploma and my BACII results. For the results, I used the cropped version posted by the Ministry of Education on Facebook, since that was the only version available to me at the time.

  

After I submitted my application, I was told the documents were incorrect and that I needed to contact the ministry for verification. That instruction alone created a new problem, since I had no idea which ministry to go to. There are multiple sub-branches, each with a different location, and nothing on the application told me which one was responsible for verification.

  

I considered using an agency to handle the process for me, but backed out after hearing from friends that the full service costs $500, with 50 percent required upfront as a deposit before I even receive an acceptance letter. On top of the cost, I was also genuinely intimidated by the idea of navigating a government building on my own.

  

So I went to my teachers at the public school for guidance. They told me to go to my khan, but couldn't tell me where the office was or which specific one I needed. I then went to a general government office to ask directly, and they referred me to several different locations spread across the city. I followed their instructions one by one, and by the time I reached what was supposedly the correct office, I still didn't have the right documents with me. That entire day was lost.

  

Once I finally gathered the correct documents and returned, I learned about an additional fee and a late fee, and that my diploma also needed to be officially notarized before it would be accepted. Altogether, the process required layered approval from multiple separate offices and ministries, each with its own deadline and its own late fee structure, none of which were listed together anywhere. The combined waiting time across all these steps ended up being so long that I missed my application deadline entirely, despite starting the process right after my exam results came out.

The core problem throughout was that the information I needed was never in one place. It was scattered across different ministry websites, social media posts, and word of mouth, with no single source telling me the required documents, the correct offices, the fees, or the deadlines all at once.  
  

Scenario 2: First-time Mothers

  

After giving birth to my son, I spent a week resting in the hospital. Before discharge, the doctors handed me a detailed medical report on my son and told me to get him registered. That was the extent of the guidance; I wasn't told which ministry or office was actually responsible for processing it.

  

Not wanting to spend hours checking every possible ministry, I decided to set aside time and figure it out myself. But time was already tight: I was on pregnancy leave, though still expected to do remote work as an assistant to my team; I was physically recovering from labour, and I was hosting daily visits from family coming to see the new baby. Realistically, I could only carve out one full day to handle the registration in person.

  

Weekends were my only free window, so that's when I tried to go. Each time, something didn't line up: the office's shift had ended, it was their lunch break, or it simply wasn't a working day for them. My free time and their available hours never overlapped. Between recovering from childbirth, caring for the baby alone, and managing remote work, I couldn't shift my schedule to match theirs, and neither could they shift to match mine. Two weeks passed this way, with every attempt missing.

  

A month in, I finally got a Monday off, a weekday, when the office would actually be open. I brought the documents the hospital gave me and went to register. Only then did I learn several things at once: I had already missed the registration deadline, incurring late fees on top of the original fee; the hospital's report wasn't sufficient on its own, since I needed additional specific documents; and I was at the wrong office entirely, since I needed to go through my khan, not the central ministry.

  

So a month of effort, plus money spent on the fee and now a late penalty, resulted in nothing being filed. And I still don't know exactly which documents I need to bring or how they need to be formatted so that next time, I can submit everything correctly in one visit, without having to rely on informally checking Telegram and Facebook updates from both the ministry and the khan just to stay current, on top of whatever unspoken procedural rules aren't posted anywhere at all.

  

Scenario 3: National Election Registration

  

 Election season came around, and I knew I needed to register to vote. The problem was, the deadline wasn't sent to me directly. It was only announced through the Ministry's Telegram channel and Facebook page. So I had to go check for myself, scrolling through weeks of posts to find the actual date, because the feed was flooded with unrelated announcements, reposts, and comments, and I couldn't always tell which post was the most recent or which one had been quietly updated or corrected later. I bookmarked what I thought was the right date, but I had no way of confirming whether it was still accurate without checking again and again.

  

On top of that, I wasn't sure if my ID was even valid for registration anymore. Nobody tells you outright; you find out the procedure depends on your age group. Younger first-time voters go through one process, people renewing an expired ID go through another, and everyone assumes you already know which category you fall into. I didn't.

  

Here's the part that confused me most: registering to vote itself is free. But if my ID happens to be outdated, I get charged a separate fee to renew a fee that has nothing to do with the election, but that I have to pay anyway just to be eligible. And if I miss that ID renewal window, I don't just pay a penalty; I lose the ability to vote entirely, with no appeal and no second window. So a paperwork issue that's technically unrelated to the election becomes the single point of failure that decides whether I get a say at all.

  

I ended up spending more time trying to verify whether my information was current than actually completing the registration.

  

Scenario 4: Government Officers 

 

From the other side of the counter, the picture looks different, but the outcome is the same. The office is short-staffed, and the people who are there are working shifts because they're human beings who also need lunch breaks, rest, and time off. When a citizen shows up expecting help exactly when the office happens to be short-handed or between shifts, there's often no one immediately free to assist, not because no one cares, but because there simply aren't enough people to cover every hour without gaps.

  

Meanwhile, the staff who are on duty are constantly interrupted. Someone walks in with a question, another person cuts the line, and a third shows up with the wrong documents entirely. Each interruption breaks whatever task the officer was in the middle of completing. Multiply that by dozens of people a day, and very little progress is made on any single case.

  

A lot of the workload is also self-inflicted by the process itself: citizens frequently arrive with documents that aren't formatted the way the system requires, missing the specific keywords or fields needed for official filing. The officer then has to explain what's wrong, send the person away to fix it, and wait for them to come back. Sometimes days or weeks later, restarting the same conversation from scratch. This repetitive back-and-forth eats up time that could otherwise go toward processing new cases.

  

And because the office doesn't have the staffing to individually track every applicant's status, there's no consistent way to flag "this person is close to a deadline" or "this person already tried once and got turned away." Each visit is treated as if it's the first, because there isn't the manpower to do otherwise. It would be a miracle if the citizens were able to access a sample and know what is required of them beforehand so when they come, the document can be registered right away, saving us both the overhead. 

  

**Decomposition into Sub-problems**

**High school graduates**

  - Identify the procedure for getting school documents notarized or certified.
  - Determine what documents are required, such as the high school diploma and BACII results.
  - Explain where students need to go and the steps they need to follow.
  - Help students understand what documents are accepted when official results or certificates are not yet available.

**First-time parents**

  - Explain how to register a newborn and obtain a birth certificate.
  - Identify the required documents.
  - Provide information about registration deadlines, locations, and possible fees.

**Citizens registering for elections**

  - Provide information about voter registration deadlines.
  - Explain what documents are required and whether they need to be renewed.
  - Identify where citizens need to register and whether there are any fees.

**Government officers**

  - Reduce repetitive questions and tasks handled by government staff.
  - Organize commonly requested information so citizens can access it themselves.
  - Reduce workload and make the process of providing government information more efficient.

  

### **2. Glossary of Terms**

  

|  |  |
| :-: | :-: |
| Terms | Meaning  |
| BacII | Cambodia's National Exam.  |
| Notarize | To officially verify that a document or signature is real. |
| Government Contact Referral | The process of directing a citizen to the relevant government ministry or office by providing available official contact information and location when additional assistance from the government office is needed.  |
| Unsupported Query | A question that SuperAsk cannot answer because there is no approved government information available in its database. |
| Effective Date | The date when a law, rule, procedure, or requirement officially begins to apply. |
| Last-Verified Date | The most recent date when information in SuperAsk was checked and confirmed to still be accurate. |
| Legal Instrument | An official legal document, such as a law, sub-decree, proclamation, regulation, or directive, that provides authority for a government procedure. |
| Government Procedure | The official steps a citizen must follow to access or complete a government service. |
| Khan  | Administrative district in Cambodia  |

  

### **3. System Requirements**

**Goals**

  

The business goals below show how SuperAsk.AI's main objective is divided into four supporting goals: comprehensive government-service information, trustworthy answers, bilingual accessibility, and ministry contact and location information. 

  

*Figure 1: Project Goals*

  

**Enumerated Functional Requirements**

Priority Weight (PW) uses a scale from 1 to 5, where 5 represents the highest-priority requirements and 1 represents the lowest-priority or optional requirements.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Identifier\*\* | \*\*PW\*\* | \*\*Requirement\*\* |
| \*\*REQ-1\*\* | 5 | The system shall provide a chat interface where users can submit questions about Cambodian government services. |
| \*\*REQ-2\*\* | 5 | The system shall accept questions in Khmer and English. |
| \*\*REQ-3\*\* | 4 | The system should support mixed Khmer-English questions. |
| \*\*REQ-4\*\* | 5 | The system shall retrieve relevant information from verified official government online sources before generating an answer. |
| \*\*REQ-5\*\* | 5 | The system shall generate answers using only relevant information retrieved from approved government sources. |
| \*\*REQ-6\*\* | 5 | The system shall display the official source or citation supporting each sourced answer. |
| \*\*REQ-7\*\* | 5 | The system shall decline to provide an unsupported answer when no verified official source can be found. |
| \*\*REQ-8\*\* | 5 | The system shall provide government-service information for Cambodian ministries and public institutions that have an available official online presence. |
| \*\*REQ-9\*\* | 4 | The system shall allow users to browse or select commonly requested government procedures. |
| \*\*REQ-10\*\* | 3 | The system shall display recent questions or conversations to help users return to previously viewed topics. |
| \*\*REQ-11\*\* | 4 | The system shall provide available online contact information for the relevant ministry or responsible office when such information is available from an official source. |
| \*\*REQ-12\*\* | 4 | The system shall provide the location of the relevant ministry or responsible office when location information is available from an official source. |
| \*\*REQ-13\*\* | 4 | If no online contact information is available, the system shall inform the user that no online contact is available and provide the ministry or responsible-office location instead. |
| \*\*REQ-14\*\* | 4 | The system shall maintain conversation context so users can ask follow-up questions during the same session. |
| \*\*REQ-15\*\* | 3 | The system should support access through the web, Telegram, and Messenger. |
| \*\*REQ-16\*\* | 5 | The system shall provide the required documents for a government procedure when the information is available from a verified official source. |
| \*\*REQ-17\*\* | 5 | The system shall provide the steps required to complete a government procedure in the correct order when available from a verified official source. |
| \*\*REQ-18\*\* | 5 | The system shall provide official fees and applicable late fees when available from a verified official source. |
| \*\*REQ-19\*\* | 5 | The system shall provide applicable deadlines or validity periods when available from a verified official source. |
| \*\*REQ-20\*\* | 4 | The system shall provide available office hours and other relevant office information when provided by a verified official source. |

  
  

**Enumerated Nonfunctional Requirements**

The numbering continues from the functional requirements. 

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Identifier\*\* | \*\*PW\*\* | \*\*Requirement\*\* |
| \*\*REQ-21\*\* | 5 | At least \*\*90% of test users\*\* should be able to submit a government-service question through the main chat interface without assistance. |
| \*\*REQ-22\*\* | 5 | During acceptance testing, no sourced answer shall contain a factual claim that is unsupported by its displayed verified official source. |
| \*\*REQ-23\*\* | 5 | The system shall correctly refuse at least \*\*95% of unsupported or out-of-scope questions\*\* included in the project test set. |
| \*\*REQ-24\*\* | 4 | Under normal testing conditions, the system should begin displaying a response within \*\*5 seconds for at least 90% of test queries\*\*. |
| \*\*REQ-25\*\* | 4 | The web interface shall remain usable without horizontal scrolling on screens from approximately \*\*360 pixels wide\*\* through standard desktop resolutions. |
| \*\*REQ-26\*\* | 4 | Khmer and English text shall display without broken, missing, or unreadable characters in the browsers used for project testing. |
| \*\*REQ-27\*\* | 5 | API keys, model credentials, and other system secrets shall remain server-side and shall not be accessible through the citizen-facing browser interface. |
| \*\*REQ-28\*\* | 4 | Every sourced answer shall visually separate the answer content from its official source or citation information. |
| \*\*REQ-29\*\* | 4 | Authorized government content and ministry information shall be updateable through stored data or configuration without requiring changes to the core answer-generation logic. |
| \*\*REQ-30\*\* | 4 | Additional ministries and public institutions shall be addable without redesigning the core retrieval and answer-generation architecture. |

  

**FURPS+ Table**

  

|  |  |
| :-: | :-: |
| \*\*FURPS+ Category\*\* | \*\*SuperAsk.AI\*\* |
| \*\*Functionality\*\* | The system supports government-service questions, Khmer and English interaction, verified-source retrieval, citations, procedure steps, required documents, fees, deadlines, office information, ministry contact details, and ministry locations. |
| \*\*Usability\*\* | The chat interface should be simple, clearly organized, responsive, and usable on both mobile and desktop devices. At least 90% of test users should be able to submit a question without assistance. |
| \*\*Reliability\*\* | The system should answer using verified official sources and refuse unsupported questions rather than guess. Sourced answers must remain consistent with their displayed sources during acceptance testing. |
| \*\*Performance\*\* | Under normal testing conditions, the system should begin displaying a response within 5 seconds for at least 90% of test queries. |
| \*\*Supportability\*\* | Government information, ministry contacts, office locations, and official sources should be updateable without changing the core answer-generation logic. Additional ministries should also be addable without major architectural redesign. |
| \*\*Security (+)\*\* | API credentials, model keys, and other system secrets must remain server-side and inaccessible through the citizen-facing browser interface. |
| \*\*Design / Implementation Constraints (+)\*\* | SuperAsk.AI shall operate as a web-based service, use verified official government information for sourced answers, and support responsive access on both mobile and desktop devices. |

  
  
  
  

**User Interface Requirements**

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Identifier\*\* | \*\*Priority\*\* | \*\*Requirement\*\* |
| \*\*REQ-31\*\* | 5 | A user shall be able to enter a government-service question in the chat input field. |
| \*\*REQ-32\*\* | 5 | A user shall be able to submit a question to SuperAsk.AI. |
| \*\*REQ-33\*\* | 5 | A user shall be able to view the answer generated by SuperAsk.AI. |
| \*\*REQ-34\*\* | 5 | A user shall be able to view the verified official source or citation supporting the answer. |
| \*\*REQ-35\*\* | 4 | A user shall be able to select a popular procedure from the interface. |
| \*\*REQ-36\*\* | 4 | A user shall be able to view recent questions or conversations.  |
| \*\*REQ-37\*\* | 4 | A user shall be able to use the interface in Khmer or English.  |
| \*\*REQ-38\*\* | 4 | A user shall be able to view available ministry contact and location information when provided by an official source. |
| \*\*REQ-39\*\* | 4 | If no online contact information is available, the interface shall state that no contact is available and display the ministry or responsible-office location. |

  

### **4. Functional Requirement Specification**

**1.  Functional Requirement Specification and Use Cases**

**Stakeholders**

Having a reliable, centralized way to access accurate government service information can reduce the confusion, wasted trips, and missed deadlines that currently push citizens toward costly agencies or repeated failed visits to the wrong office. This can also ease pressure on government offices themselves, since fewer citizens will arrive with incomplete documents or outdated information. Making government procedures easier to understand and follow benefits individual citizens as well as the broader public institutions they depend on. However, we have identified these primary stakeholders:

**Citizens (Individual Users):** use the system to look up information about government procedures such as document notarization, birth registration, and voter registration. These users will benefit by having accurate, up-to-date requirements, deadlines, and fees available in one place instead of scattered across ministry websites, Facebook posts, and word of mouth. Having a bilingual chat interface that clearly cites its sources will allow citizens to prepare correctly before visiting an office, reducing the stress, wasted time, and unexpected fees described in Scenarios 1 through 3.

**Government Officers and Public Institutions:** Do not use SuperAsk.AI directly, but they publish the official information it relies on and remain the point of contact for citizens who prepare through the app. These stakeholders will benefit by receiving fewer repetitive questions and fewer citizens arriving with missing or incorrectly formatted documents. Reducing this repetitive back-and-forth, as described in Scenario 4, will free up staff time to process more cases and reduce the strain caused by understaffing and constant interruptions.

**Ministries and Government Agencies:** These are the organizations whose official procedures, requirements, and contact information are published on their websites, Facebook pages, and Telegram channels, and collected into the system from there. These stakeholders have an interest in ensuring the information SuperAsk.AI displays is accurate, properly sourced, and kept current, since any errors would reflect on the ministry itself. As more ministries are added under REQ-30, this group will continue to grow alongside the system's coverage.

**Professor Hieu Vu and the CSCI 441 Course** serve as the academic sponsor and evaluator of the project. This stakeholder has an interest in seeing the team apply sound software engineering practices throughout requirements gathering, design, implementation, and testing, and in reviewing the team's progress at each report and demonstration milestone.

**Team AO3 (Developers):** are deeply invested in the success of SuperAsk.AI. Each member is responsible for a specific area, including AI and retrieval accuracy, backend and database development, content curation, quality assurance, and interface design. The team's dedication to building a functional, trustworthy, and easy to use system is critical to ensuring the project meets both its academic requirements and its intended real world purpose.

1.  **Actors and Goals**

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Actor\*\* | \*\*Participating / Initiating\*\* | \*\*Role\*\* | \*\*Goal\*\* |
| Citizen / User | Initiating | The User interacts with SuperAsk.AI to ask questions about Cambodian government procedures and services. | The goal of the User is to receive accurate government-service information in Khmer or English, including procedures, required documents, fees, deadlines, office information, and verified sources. |
| AI Model Service | Participating | The AI Model Service processes the user's question together with retrieved government information to generate a relevant response. | The goal of the AI Model Service is to generate a clear response based on the approved information provided by SuperAsk.AI. |
| Telegram Platform | Participating | The Telegram Platform provides an additional communication channel through which users may interact with SuperAsk.AI. | The goal of the Telegram Platform is to transmit user questions to SuperAsk.AI and deliver generated responses back to the user. |
| Messenger Platform | Participating | The Messenger Platform provides an additional communication channel through which users may interact with SuperAsk.AI. | The goal of the Messenger Platform is to transmit user questions to SuperAsk.AI and deliver generated responses back to the user. |
| Scheduler (System Timer) | Initiating | The Scheduler starts SuperAsk.AI’s content refresh at set intervals, without any user action. | The goal of the Scheduler is to keep the stored government information current, so that answers and last-verified dates reflect what ministries have most recently published. |
| Official Sources (Ministry Websites, Facebook Pages, Telegram Channels) | Participating | The Official Sources are the public online channels where ministries publish procedures, fees, deadlines, and contact details. SuperAsk.AI crawls them to collect its content. | The goal of the Official Sources is to provide the up-to-date official information that every SuperAsk.AI answer and citation is based on. |

  

**Use Cases**

**Casual Description**

The use cases below cover every system requirement from Report One, Part One. Each one lists the requirements it responds to. UC-1 to UC-10 are started by the Citizen / User. UC-11 is started by the system's own scheduler. It keeps the stored government information current by crawling official ministry websites, Facebook pages, and Telegram channels.

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Use Case\*\* | \*\*Name\*\* | \*\*Casual Description\*\* | \*\*Requirements\*\* |
| UC-1 | AskQuestion | The user types a question about a Cambodian government service in Khmer, English, or a mix of both, and submits it. SuperAsk.AI finds the relevant official information and returns an answer. Where the source has them, the answer lists the procedure steps in order, the required documents, fees and late fees, deadlines or validity periods, and office hours. | REQ-1, REQ-2, REQ-3, REQ-5, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-31, REQ-32, REQ-33 |
| UC-2 | RetrieveOfficialSources | The system searches its stored official government content for the passages most relevant to the question and passes only those to the AI Model Service. It is always included in UC-1. | REQ-4, REQ-5, REQ-8 |
| UC-3 | ViewSourceCitation | The user sees the official source behind the answer: the ministry, the document or page, a link, the effective date, and the last-verified date. The citation is kept visually separate from the answer text. It is always included when a sourced answer is shown. | REQ-6, REQ-28, REQ-34 |
| UC-4 | DeclineUnsupportedQuestion | If no verified official source covers the question, or the question is out of scope, the system says it cannot answer. It does not guess. It tells the user which areas it does cover so they can rephrase. This extends UC-1. | REQ-7 |
| UC-5 | BrowsePopularProcedures | The user picks a common procedure, such as passport application or birth certificate, from the sidebar or the welcome screen. The system sends it as a question and answers it as in UC-1. | REQ-9, REQ-35 |
| UC-6 | ViewRecentConversations | The user opens the list of recent questions and conversations and selects one to go back to a topic they viewed earlier. | REQ-10, REQ-36 |
| UC-7 | GetOfficeContactAndLocation | The user asks for the contact details and location of the ministry or office that handles their procedure. The system shows the phone number, address, office hours, and a map link. If there is no online contact, it says so and shows the office location instead. | REQ-11, REQ-12, REQ-13, REQ-20, REQ-38, REQ-39 |
| UC-8 | AskFollowUpQuestion | After receiving an answer, the user asks a follow-up question, such as "how much does it cost?". The system uses the earlier conversation to work out what "it" refers to. This extends UC-1. | REQ-14 |
| UC-9 | AskThroughMessagingChannel | The user sends a question to SuperAsk.AI through Telegram or Messenger instead of the website. The platform forwards it, the system answers it through UC-1, and the platform sends back the answer with its source. | REQ-15 |
| UC-10 | SwitchLanguage | The user switches the interface between Khmer and English. Answers come back in the language the question was asked in. | REQ-2, REQ-37 |
| UC-11 | RefreshOfficialContent | On a schedule, the system crawls the registered official sources: ministry websites, Facebook pages, and Telegram channels. It saves new or changed content with its source link and fetch date, and updates the stored information and its last-verified date. New ministries are added by registering their sources, without changing the answer-generation logic. | REQ-4, REQ-8, REQ-29, REQ-30 |

  

**Use Case Diagram**

*Figure 2: Use Case Diagram*

The diagram above shows how the SuperAsk.AI use cases relate to each other and to the actors. AskQuestion (UC-1) is the central use case: it always includes RetrieveOfficialSources (UC-2) and ViewSourceCitation (UC-3), because every answer is looked up and cited. BrowsePopularProcedures (UC-5) and AskThroughMessagingChannel (UC-9) include AskQuestion, since they are other ways of asking the same question. AskFollowUpQuestion (UC-8) and DeclineUnsupportedQuestion (UC-4) extend AskQuestion, because they only happen in some conversations. RefreshOfficialContent (UC-11) is started by the Scheduler and collects content from the official ministry websites, Facebook pages, and Telegram channels.

**Traceability Matrix (1) - System Requirements to Use Cases**  
The traceability matrix below maps each system requirement from Report One, Part One to the use cases that satisfy it. The priority weight of a use case is the sum of the priority weights (PW) of the requirements it covers. Nonfunctional requirements REQ-21 to REQ-27 (usability, accuracy, refusal rate, response time, screen width, Khmer display, and security) are quality constraints on the whole system rather than on a single use case, so they are verified through system testing instead of being traced here.

|  |  |  |  |  |  |  |  |  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| \*\*Req't\*\* | \*\*PW\*\* | \*\*UC-1\*\* | \*\*UC-2\*\* | \*\*UC-3\*\* | \*\*UC-4\*\* | \*\*UC-5\*\* | \*\*UC-6\*\* | \*\*UC-7\*\* | \*\*UC-8\*\* | \*\*UC-9\*\* | \*\*UC-10\*\* | \*\*UC-11\*\* |
| REQ-1 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-2 | 5 | X |   |   |   |   |   |   |   |   | X |   |
| REQ-3 | 4 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-4 | 5 |   | X |   |   |   |   |   |   |   |   | X |
| REQ-5 | 5 | X | X |   |   |   |   |   |   |   |   |   |
| REQ-6 | 5 |   |   | X |   |   |   |   |   |   |   |   |
| REQ-7 | 5 |   |   |   | X |   |   |   |   |   |   |   |
| REQ-8 | 5 |   | X |   |   |   |   |   |   |   |   | X |
| REQ-9 | 4 |   |   |   |   | X |   |   |   |   |   |   |
| REQ-10 | 3 |   |   |   |   |   | X |   |   |   |   |   |
| REQ-11 | 4 |   |   |   |   |   |   | X |   |   |   |   |
| REQ-12 | 4 |   |   |   |   |   |   | X |   |   |   |   |
| REQ-13 | 4 |   |   |   |   |   |   | X |   |   |   |   |
| REQ-14 | 4 |   |   |   |   |   |   |   | X |   |   |   |
| REQ-15 | 3 |   |   |   |   |   |   |   |   | X |   |   |
| REQ-16 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-17 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-18 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-19 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-20 | 4 | X |   |   |   |   |   | X |   |   |   |   |
| REQ-28 | 4 |   |   | X |   |   |   |   |   |   |   |   |
| REQ-29 | 4 |   |   |   |   |   |   |   |   |   |   | X |
| REQ-30 | 4 |   |   |   |   |   |   |   |   |   |   | X |
| REQ-31 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-32 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-33 | 5 | X |   |   |   |   |   |   |   |   |   |   |
| REQ-34 | 5 |   |   | X |   |   |   |   |   |   |   |   |
| REQ-35 | 4 |   |   |   |   | X |   |   |   |   |   |   |
| REQ-36 | 4 |   |   |   |   |   | X |   |   |   |   |   |
| REQ-37 | 4 |   |   |   |   |   |   |   |   |   | X |   |
| REQ-38 | 4 |   |   |   |   |   |   | X |   |   |   |   |
| REQ-39 | 4 |   |   |   |   |   |   | X |   |   |   |   |
| \*\*Max PW\*\* |   | \*\*58\*\* | \*\*15\*\* | \*\*14\*\* | \*\*5\*\* | \*\*8\*\* | \*\*7\*\* | \*\*24\*\* | \*\*4\*\* | \*\*3\*\* | \*\*9\*\* | \*\*18\*\* |

Ranked by priority weight: UC-1 (58), UC-7 (24), UC-11 (18), UC-2 (15), UC-3 (14), UC-10 (9), UC-5 (8), UC-6 (7), UC-4 (5), UC-8 (4), UC-9 (3). The five highest-weighted use cases, UC-1 AskQuestion, UC-7 GetOfficeContactAndLocation, UC-11 RefreshOfficialContent, UC-2 RetrieveOfficialSources, and UC-3 ViewSourceCitation, are elaborated in Sections 3c-iv and 3d and planned for the first demo. UC-4 DeclineUnsupportedQuestion has a low weight because it traces to a single requirement, but it will also be shown in the first demo, since it runs inside UC-1 whenever no verified source is found.

**Fully-Dressed Description**

The five use cases below have the highest priority weights in the traceability matrix (Section 3c-iii) and form the core of the first demonstration. In each flow, → marks an action by an actor and ← marks the system's response.

|  |  |
| :-: | :-: |
| \*\*Use Case UC-1: AskQuestion\*\* |  |
| \*\*Requirements\*\* | REQ-1, REQ-2, REQ-3, REQ-5, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-31, REQ-32, REQ-33 |
| \*\*Initiating Actor\*\* | Citizen / User |
| \*\*Actor's Goal\*\* | To get accurate information about a government procedure (steps, required documents, fees, deadlines, office hours) in Khmer or English. |
| \*\*Participating Actors\*\* | AI Model Service |
| \*\*Preconditions\*\* | The SuperAsk.AI web interface is open. The stored official content has been loaded (UC-11 has run at least once). |
| \*\*Postconditions\*\* | The user has an answer supported by a displayed official source, or a clear statement that no verified source is available (UC-4). The question and answer appear in the recent conversations list. |
| \*\*Flow of Events for Main Success Scenario\*\* | → 1. \*\*User\*\* types a question in Khmer, English, or a mix of both into the chat input field.→ 2. \*\*User\*\* submits the question by pressing Enter or the send button.← 3. \*\*System\*\* shows the question in the conversation and a loading indicator.← 4. \*\*System\*\* detects the question's language and normalises the Khmer text.← 5. \*\*System\*\* checks that the question is about a government service and not an out-of-scope request.← 6. \*\*include::\*\* RetrieveOfficialSources (UC-2).← 7. \*\*System\*\* sends the question and the retrieved passages to the \*\*AI Model Service\*\*, which writes an answer using only those passages.← 8. \*\*System\*\* checks that every fee, date, and document in the answer appears in a cited source.← 9. \*\*System\*\* shows the answer in the question's language. Where available, it lists the steps in order, the required documents, fees and late fees, deadlines, and office hours.← 10. \*\*include::\*\* ViewSourceCitation (UC-3).← 11. \*\*System\*\* adds the question to the recent conversations list. |
| \*\*Flow of Events for Extensions (Alternate Scenarios)\*\* | 2a. User submits an empty input.← 1. System ignores the submission and keeps the send button disabled.5a. The question is not about a government service (for example, general knowledge or translation).← 1. System tells the user that SuperAsk.AI only answers questions about Cambodian government services, and makes no retrieval or model call.6a. No passage relevant enough to the question is found.← 1. \*\*extend::\*\* DeclineUnsupportedQuestion (UC-4).7a. The AI Model Service is unavailable or times out.← 1. System falls back to showing the most relevant retrieved passage word for word, with its citation.8a. The answer contains a claim that no cited source supports.← 1. The system withholds the answer and tells the user it could not confirm every detail against an official source.9a. The user asks a follow-up question about the answer.→ 1. \*\*extend::\*\* AskFollowUpQuestion (UC-8). |

  
  

|  |  |
| :-: | :-: |
| \*\*Use Case UC-2: RetrieveOfficialSources\*\* |  |
| \*\*Related Requirements\*\* | REQ-4, REQ-5, REQ-8 |
| \*\*Initiating Actor\*\* | Included by UC-1 AskQuestion (on behalf of Citizen / User) |
| \*\*Actor's Goal\*\* | To find the official passages that answer the question, so that the answer is based only on them. |
| \*\*Participating Actors\*\* | None (uses the system's stored official content) |
| \*\*Preconditions\*\* | A question has been submitted and passed the scope check. The content store contains official content collected by UC-11. |
| \*\*Postconditions\*\* | A ranked list of relevant passages is returned, each with its source metadata, or an empty result that triggers UC-4. |
| \*\*Flow of Events for Main Success Scenario\*\* | ← 1. \*\*System\*\* splits the Khmer or English question into search terms and adds known synonyms and abbreviations (for example, "MPWT" and "Ministry of Public Works and Transport").← 2. \*\*System\*\* runs a keyword search and a meaning-based search over the stored content.← 3. \*\*System\*\* merges and re-ranks the two result lists.← 4. \*\*System\*\* removes outdated or replaced content, keeping only content that is currently in effect.← 5. \*\*System\*\* checks that the top result scores above the minimum relevance threshold.← 6. \*\*System\*\* returns the top passages, each with its ministry, source link, effective date, and last-verified date. |
| \*\*Flow of Events for Extensions (Alternate Scenarios)\*\* | 2a. The question is a follow-up that does not name its subject (for example, "how much is it?").← 1. System rewrites the question using the earlier conversation before searching. 5a. No result reaches the minimum relevance threshold.← 1. System returns an empty result, and the calling use case continues with DeclineUnsupportedQuestion (UC-4). 5b. The top result is related but does not mention most of what was asked.← 1. System marks the result as low confidence, so the answer is shown with a note that the source may not fully answer the question. |

  

|  |  |
| :-: | :-: |
| \*\*Use Case UC-3: ViewSourceCitation\*\* |  |
| \*\*Related Requirements\*\* | REQ-6, REQ-28, REQ-34 |
| \*\*Initiating Actor\*\* | Citizen / User |
| \*\*Actor's Goal\*\* | To confirm where the answer came from and how current it is. |
| \*\*Participating Actors\*\* | None |
| \*\*Preconditions\*\* | A sourced answer has been shown (UC-1). |
| \*\*Postconditions\*\* | The user has seen the source details and, if they chose to, opened the official source. |
| \*\*Flow of Events for Main Success Scenario\*\* | ← 1. \*\*System\*\* shows a "Verified Source" card under the answer, visually separate from the answer text.← 2. \*\*System\*\* shows the ministry, document or page title, effective date, and last-verified date on the card.→ 3. \*\*User\*\* reads the source details.→ 4. \*\*User\*\* selects the link icon on the card.← 5. \*\*System\*\* opens the official source page (ministry website, Facebook post, or Telegram post) in a new tab. |
| \*\*Flow of Events for Extensions (Alternate Scenarios)\*\* | 2a. The source's last-verified date is past its review date.← 1. System marks the citation as possibly outdated and adds a note asking the user to confirm with the office before acting. 2b. The answer is supported by more than one source.← 1. System shows one card per source, in the order they are cited. 3a. User finds the information incorrect.→ 1. User selects "Report" on the answer and optionally adds a comment.← 2. System records the report against the cited source for review. |

  

|  |  |
| :-: | :-: |
| \*\*Use Case UC-7: GetOfficeContactAndLocation\*\* |  |
| \*\*Related Requirements\*\* | REQ-11, REQ-12, REQ-13, REQ-20, REQ-38, REQ-39 |
| \*\*Initiating Actor\*\* | Citizen / User |
| \*\*Actor's Goal\*\* | To know how to contact the responsible ministry or office and where to go in person. |
| \*\*Participating Actors\*\* | None (uses the stored office information) |
| \*\*Preconditions\*\* | The web interface is open. Contact and location details for the office have been collected from its official website, Facebook page, or Telegram channel (UC-11). |
| \*\*Postconditions\*\* | The user has the office's contact details and location, or a clear statement that no online contact is available together with the office location. |
| \*\*Flow of Events for Main Success Scenario\*\* | → 1. \*\*User\*\* asks for the contact and location of the office responsible for a procedure (for example, "can I have the contact and location of the ministry for this?").← 2. \*\*System\*\* works out which procedure "this" refers to from the conversation (UC-8).← 3. \*\*System\*\* finds the ministry or office responsible for that procedure.← 4. \*\*System\*\* shows a contact card with the office name, address, office hours, phone number, and an "Open in Google Maps" link.← 5. \*\*System\*\* shows the official source the contact details came from.→ 6. \*\*User\*\* selects "Open in Google Maps".← 7. \*\*System\*\* opens the office location in Google Maps in a new tab. |
| \*\*Flow of Events for Extensions (Alternate Scenarios)\*\* | 4a. No online contact information is available for the office.← 1. System states "No verified online contact information is available."← 2. System shows the office location and the Google Maps link instead. 4b. Neither contact nor location information is available from an official source.← 1. System says it has no verified contact or location for this office and does not guess one. 3a. The procedure is handled by several offices (for example, a provincial office and the ministry in Phnom Penh).← 1. System asks the user which province they are in.→ 2. User answers, and the flow continues at step 4 with the matching office. 1a. User asks without naming or having discussed a procedure.← 1. System asks which procedure or ministry the user needs.→ 2. User names it, and the flow continues at step 3. |

  

|  |  |
| :-: | :-: |
| \*\*Use Case UC-11: RefreshOfficialContent\*\* |  |
| \*\*Related Requirements\*\* | REQ-4, REQ-8, REQ-29, REQ-30 |
| \*\*Initiating Actor\*\* | Scheduler (System Timer) |
| \*\*Actor's Goal\*\* | To keep the stored government information current, so that answers and last-verified dates reflect what ministries have most recently published. |
| \*\*Participating Actors\*\* | Official Sources (Ministry Websites, Facebook Pages, Telegram Channels) |
| \*\*Preconditions\*\* | Each covered ministry's official website, public Facebook page, and public Telegram channel is registered in SuperAsk.AI's source list with its link and platform. |
| \*\*Postconditions\*\* | New or changed content is stored with its source link and fetch date, the last-verified date of every source checked successfully is updated, and a refresh report records which sources were checked, changed, or failed. |
| \*\*Flow of Events for Main Success Scenario\*\* | → 1. Scheduler starts the content refresh at its set time.← 2. System loads the list of registered official sources.← 3. System requests the latest page or posts from each Official Source: a ministry web page, a public Facebook page, or a public Telegram channel.→ 4. Official Source returns its content.← 5. System extracts the text, removing menus and other repeated page elements.← 6. System compares the text with the stored copy.← 7. System saves any new or changed text with its source link and fetch date, and updates the information used for answers.← 8. System updates the last-verified date of each source it checked successfully.← 9. System records a refresh report listing the sources checked, changed, and failed. |
| \*\*Flow of Events for Extensions (Alternate Scenarios)\*\* | 2a. A new ministry's sources were added to the source list.← 1. System includes them in this refresh, with no change to the answer-generation logic (REQ-30).3a. The source's robots.txt rules do not allow automated access.← 1. System skips the source and records it as blocked.4a. The source does not respond or returns an error.← 1. System keeps the stored copy and its previous last-verified date, and records the failure.4b. The source returns a login or block page instead of real content.← 1. System treats the response as a failure, not as changed content.6a. The content has not changed.← 1. System keeps the stored text and only updates the last-verified date. |

  

1.  **\*\*System Sequence Diagrams\*\***

The system sequence diagrams below show the messages exchanged between the actors and SuperAsk.AI, which is treated as a single black box, for the five use cases elaborated in Section 3c-iv. Solid arrows are requests, dashed arrows are responses, and the orange frames mark alternative (alt), optional (opt), and repeated (loop) parts of the flow.

*Figure 3: System sequence diagram for UC-1: AskQuestion*

*Figure 4: System sequence diagram for UC-2: RetrieveOfficialSources*

*Figure 5: System sequence diagram for UC-3: ViewSourceCitation*

*Figure 6: System sequence diagram for UC-7: GetOfficeContactAndLocation*

*Figure 7: System sequence diagram for UC-11: RefreshOfficialContent*

**2. User Interface Specification**

1.  **\*\*Preliminary Design\*\***

The SuperAsk.AI user interface is designed to provide citizens with a simple way to access information about Cambodian government services and procedures. The main interaction uses a chat-style interface so that users can ask questions in natural language rather than searching through multiple government websites or documents.  

The interface design follows the requirements established in Report One. Users can enter and submit questions, view generated answers and verified official sources, select commonly requested procedures, return to recent questions, and use the interface in Khmer or English. The following mock-ups show the main navigation path, the information entered by the user, the controls used to complete each interaction, and the information displayed by SuperAsk.AI.

1.  **\*\*Starting a Government-Service Question\*\***

The user can access the chat interface from the SuperAsk.AI Home Page by selecting Ask on the web or Ask now. The Home Page also provides access to language selection and supporting information about the service.

**Navigation Path:****  
**Home Page → Ask on the web / Ask now → Chat Interface → Enter Question or Select Procedure → Send / Select → Response

**User Interaction:**

1.  The user opens the SuperAsk.AI Home Page.
2.  If necessary, the user selects Khmer or English from the language control.
3.  The user selects Ask on the web or Ask now to enter the chat interface.

  **Primary controls:** Ask on the web, Ask now, language selection  
  **Result:** The user enters the SuperAsk.AI chat interface.

*Figure 8. SuperAsk.AI Home Page*

The initial chat screen provides three ways to begin an interaction. The user can enter a new question in the input field, select a previous question from Recent, or choose one of the Popular Procedures displayed in the interface.

1.  The user may select a question from Recent, select a procedure from Popular Procedures, or use the main question input field.
2.  To ask a new question, the user clicks the input field.
3.  The user types a government-service question in Khmer or English.
4.  The user presses the Send button.
5.  SuperAsk.AI displays the corresponding response in the conversation area.
6.  The user can continue asking follow-up questions through the same input field.

**Input field:** Government-service question  
 **Primary controls:** Send button, Recent questions, Popular Procedures, New chat, language control  
 **Displayed result:** The submitted question and corresponding response

*Figure 9. SuperAsk.AI initial chat interface*

  **2. Viewing a Government-Procedure Answer**

When SuperAsk.AI finds relevant information from a verified government source, the answer is displayed as a structured response card. The current prototype uses a driving licence renewal question to demonstrate this interaction.

The user's submitted question is displayed in a separate message bubble. The answer card then identifies the responsible government organization and presents the important procedure information in separate sections.

For the procedure shown in the mock-up, the response layout contains fields for Documents, Fee, Time, and Office, followed by the required procedure Steps. The verified source is displayed in a separate source area beneath the answer.

**Navigation Path:****  
**Chat Interface → Enter Question → Send → Procedure Answer → View Verified Source / Office Information

**User Interaction:**

1.  The user enters a government-procedure question in the input field.
2.  The user presses the Send button.
3.  The submitted question appears in the conversation area.
4.  SuperAsk.AI displays the relevant procedure answer.
5.  The user reviews the required documents, fee, expected processing time, responsible office, and procedure steps when that information is available.
6.  The user reviews the Verified Source displayed beneath the procedure information.
7.  The user may select the source-link control to access the referenced source.
8.  If location information is available, the user may select Show office on map.
9.  The user may select Yes or No under Was this helpful? to provide feedback.
10. The user can enter a follow-up question through the input field or select New chat to begin another conversation.

**Input:** Government-procedure question  
**Primary controls:** Send, verified-source link, Show office on map, Yes/No feedback, New chat  
**Displayed result:** Procedure information, required documents, fees, processing time, responsible office, ordered steps, and verified source

*Figure 10. SuperAsk.AI government-procedure answer with verified source.*

  

  

**3. Handling an Unsupported or Out-of-Scope Question**

SuperAsk.AI is specifically designed for questions related to Cambodian government procedures. Therefore, the interface also needs to clearly handle questions that fall outside the supported scope.

The out-of-scope mock-up demonstrates a user submitting the message *“hello.”* Instead of generating an unrelated response, SuperAsk.AI displays a message explaining that the service only answers questions about Cambodian government procedures and suggests relevant types of questions.

**Navigation Path:****  
**Chat Interface → Enter Unsupported Question → Send → Out-of-Scope Message → Enter Another Question

**User Interaction:**

1.  The user types a question or message into the chat input field.
2.  The user presses the Send button.
3.  The submitted message appears in the conversation area.
4.  If the request is outside the supported scope, SuperAsk.AI displays an out-of-scope response instead of presenting an unsupported answer.
5.  The response explains that SuperAsk.AI is intended for Cambodian government procedures.
6.  The interface suggests examples of supported topics, such as licences, certificates, registrations, or permits.
7.  The user may return to the input field and enter another question.
8.  Alternatively, the user may select New chat to begin a new conversation.

**Input:** Unsupported or unrelated question  
**Primary controls:** Send button, question input, New chat  
**Displayed result:** Out-of-scope guidance message

*Figure 11. SuperAsk.AI out-of-scope response.*

The interface was designed to minimize unnecessary navigation. Users can ask a question directly instead of first selecting a ministry or category, while popular procedures remain available as optional shortcuts. Procedure answers use a structured card rather than a long paragraph so that documents, fees, processing time, office information, steps, and verified sources are easier to identify.

  

### **5. Effort Estimation Using Use Case Points** 

This estimate applies the Use Case Points (UCP) method to the current SuperAsk.AI prototype. The project’s requirements describe a bilingual assistant for Cambodian government services. A citizen can ask a question, receive an answer based on retrieved government information, and view its source. The prototype also includes conversation history, popular procedures, follow-up questions, Telegram access, and web content monitoring.

The estimate uses the implemented scope documented in the repository. It does not count the planned Messenger integration or the unfinished office contact card and office-directory routing as completed features. The web crawler is included for the functionality it currently provides; changed content is sent for review rather than automatically published. This distinction matters because an estimate based on every feature in the original plan would describe a larger system than the prototype that has been built.

**Requirements and implemented use cases**

Report One defines functional requirements for submitting questions in Khmer and English, retrieving information from official sources, generating grounded answers, displaying citations, declining unsupported questions, browsing popular procedures, viewing recent conversations, asking follow-up questions, and accessing office details. It also defines quality and interface requirements, including answer accuracy, refusal behavior, response time, responsive screens, readable Khmer text, server-side protection of credentials, and separation of answers from citations.

The current implementation supports the main question-and-answer flow, retrieval, citations, declines, popular procedures, recent conversation history, follow-up questions, Khmer and English interaction, and Telegram access. Web content monitoring is also implemented. The report and project documentation identify office contact and location handling as incomplete, and Messenger as planned. Therefore, those unfinished portions are excluded from the UCP calculation below.

**Unadjusted Use Case Points**

The calculation uses standard UCP classifications. Actors are rated as simple (1 point) when they interact through a defined interface or API, average (2 points) when interaction requires a more involved protocol, and complex (3 points) when they use a human-facing interface. Use cases are rated by the number of transactions in their documented flows: simple (up to 3 transactions, 5 points), average (4–7 transactions, 10 points), and complex (more than 7 transactions, 15 points).

For this estimate, the included actors are the citizen, AI model service, Telegram platform, scheduler, and official web sources. The citizen is a complex actor because they use the chat interface. The model service, Telegram platform, and scheduler are treated as simple actors because they communicate through defined APIs or scheduled operations. Official web sources are rated average because the crawler must interact with multiple external websites. Thus, the Unadjusted Actor Weight (UAW) is:

UAW = 3 + 1 + 1 + 1 + 2 = 8

**The included use cases represent the functionality currently implemented or partially implemented within the stated scope:**

**  
  
**

|  |  |  |
| :-: | :-: | :-: |
| Use case | Complexity | Weight |
| UC-1 Ask Question | Complex | 15 |
| UC-2 Retrieve Official Sources | Average | 10 |
| UC-3 View Source Citation | Average | 10 |
| UC-4 Decline Unsupported Question | Simple | 5 |
| UC-5 Browse Popular Procedures | Simple | 5 |
| UC-6 View Recent Conversations | Simple | 5 |
| UC-8 Ask Follow-up Question | Average | 10 |
| UC-9 Ask Through Telegram | Average | 10 |
| UC-10 Switch Language | Simple | 5 |
| UC-11 Refresh Official Content | Average | 10 |
| Total UUCW |   | 85 |

UC-7, Get Office Contact and Location, is excluded because the full office-directory and contact-card behavior is still incomplete. UC-9 is counted for Telegram access; Messenger is not included. UC-11 is rated for the web-based monitoring and review flow implemented in the prototype.

The Unadjusted Use Case Points (UUCP) are the actor weight plus the use case weight:

UUCP = UAW + UUCW = 8 + 85 = 93

  

**Technical Complexity Factor**

The Technical Complexity Factor (TCF) adjusts the estimate for technical demands. Each factor is rated from 0 to 5, where a higher rating means the factor has a stronger effect on development effort. The technical factor is calculated as **TF = sum of (weight × rating)**, followed by **TCF = 0.6 + (0.01 × TF)**.

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| Technical factor | Weight | Rating | Weighted score |
| Distributed system | 2.0 | 4 | 8.0 |
| Performance objectives | 1.0 | 3 | 3.0 |
| End-user efficiency | 1.0 | 4 | 4.0 |
| Complex internal processing | 1.0 | 4 | 4.0 |
| Reusable code | 1.0 | 3 | 3.0 |
| Ease of installation | 0.5 | 3 | 1.5 |
| Ease of use | 0.5 | 4 | 2.0 |
| Portability | 2.0 | 4 | 8.0 |
| Ease of change | 1.0 | 4 | 4.0 |
| Concurrency | 1.0 | 3 | 3.0 |
| Security requirements | 1.0 | 3 | 3.0 |
| Third-party access | 1.0 | 4 | 4.0 |
| Training requirements | 1.0 | 2 | 2.0 |
| Total technical factor (TF) |   |   | 49.5 |

The system receives higher ratings for distributed operation and third-party access because it connects a web interface, Telegram, an AI provider, and external government websites. The Khmer and English processing, retrieval pipeline, and answer-verification steps also add internal complexity. The resulting factor is:

TCF = 0.6 + (0.01 × 49.5) = 1.095

  

**Environmental Complexity Factor**

The Environmental Complexity Factor (ECF) accounts for team and project conditions. Each factor is rated from 0 to 5. The environmental factor is EF = sum of (weight × rating), and ECF = 1.4 − (0.03 × EF).

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| Environmental factor | Weight | Rating | Weighted score |
| Familiarity with the project domain | 1.5 | 3 | 4.5 |
| Application development experience | 0.5 | 3 | 1.5 |
| Object-oriented experience | 1.0 | 3 | 3.0 |
| Analyst capability | 0.5 | 3 | 1.5 |
| Team motivation | 1.0 | 4 | 4.0 |
| Requirements stability | 2.0 | 3 | 6.0 |
| Part-time team availability | −1.0 | 4 | −4.0 |
| Difficulty of the implementation language | −1.0 | 3 | −3.0 |
| Total environmental factor (EF) |   |   | 13.5 |

These ratings are estimates based on the academic team setting and the prototype’s evolving requirements. In particular, part-time availability and changes between the initial requirements and the implemented prototype increase the effort risk. The resulting factor is:

ECF = 1.4 − (0.03 × 13.5) = 0.995

**Effort calculation**

The adjusted Use Case Points are calculated as:

UCP = UUCP × TCF × ECF

UCP = 93 × 1.095 × 0.995 = 101.34 UCP

Using the specified productivity factor of PF = 28 hours per UCP, the estimated development effort is:

Effort = UCP × PF

Effort = 101.34 × 28 = 2,837.52 hours

The estimated effort for the included prototype scope is therefore approximately 2,838 person-hours. This is a planning estimate, not a record of hours already worked. The 28-hour productivity factor is applied uniformly to the adjusted UCP total.

The UCP estimate places the current SuperAsk.AI prototype at approximately **101 adjusted Use Case Points**, or **2,838 development hours** using the required productivity factor. The largest effort drivers are the bilingual question-and-answer flow, retrieval and citation behavior, external service connections, and the safety checks that prevent unsupported answers from being presented as verified information.

1.  **\*\*Ask a Government Service Question\*\***

The following sequence of actions allows a user to enter and submit the government-service question “How do I renew my driving licence?” through the Superask.AI chat interface.

Navigation: Total of 1 click, as follows:

1.1. Click the chat input box.

Data Entry: Total of 1 click and 34 key presses, as follows:

1.2. Press 34 keys to enter “How do I renew my driving license?”  
1.3. Click the Send button to submit the question.

1.  **\*\*Select a Suggested Procedure\*\***

The following sequence of actions allows a user to select one of the suggested government-service procedures displayed by SuperAsk.AI instead of manually entering a question.

Navigation: Total of 1 click, as follows:

2.1. Click one of the suggested procedure options.

Data Entry: Total of 0 key presses.

The system displays the corresponding procedure information without requiring the user to manually type a question.

1.  **\*\*View a Verified Source\*\***

The following sequence of actions allows a user to access the official source associated with a response.

Navigation: Total of 1 click, as follows:

3.1. Click the Source link displayed below the answer.

Data Entry: Total of 0 key presses.

The system opens the verified source associated with the government-service information.

1.  **\*\*View an Office Location\*\***

The following sequence of actions allows a user to view the location of the government office associated with a procedure.

Navigation: Total of 1 click, as follows:

4.1. Click the Show on Map button.

Data Entry: Total 0 key presses.

The system displays the relevant office location on the map.

1.  **\*\*Ask a Follow-Up Question\*\***

The following sequence of actions allows a user to ask a follow-up question after receiving a government-procedure response. For this example, the user asks “How long does it take?”

Navigation: Total of 1 click, as follows:

5.1. Click the chat input box.

Data Entry: Total of 1 click and 22 key presses, as follows:

5.2. Press 22 keys to enter “How long does it take?”  
5.3. Click the Send button to submit the follow-up question.

1.  **\*\*Start a New Chat\*\***

The following sequence of actions allows the user to clear the current conversation and begin another request.

Navigation: Total of 1 click, as follows:

6.1. Click the New Chat button.

Data Entry: Total of 0 key presses.

The system opens a new chat session where the user can enter another government-service question.

  

### **6. Domain Analysis**

6a. Domain Concepts

Report One did not include a separate domain model. Report Two traced design classes back to the nouns of Report One. This section defines the domain model from the problem statement (Section 1), the requirements (Section 3), the use cases (Section 4) and the implemented prototype. Domain concepts describe things in the citizen's world and the ministry's world, not software classes. They are numbered DC-1 to DC-20 so the matrices in 6e to 6g can refer to them. The last column says where each concept appears in the repository.

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| \*\*ID\*\* | \*\*Domain concept\*\* | \*\*Definition\*\* | \*\*Key attributes\*\* | \*\*In the repository\*\* |
| DC-1 | Citizen (User) | The person who asks about a government service and uses the answer to prepare for a visit. An actor outside the system. | preferred language, channel used | Browser or Telegram chat. The login and register pages keep a local SessionUser (lib/ui/auth-session.ts). Real authentication is still in progress. |
| DC-2 | Question | A request for information about a government service, in Khmer or English. | text, earlier turns, session id | AskRequest (lib/types.ts) |
| DC-3 | Language | Khmer or English. It applies to questions, answers and the interface. | code (km or en) | type Lang; lib/lang/detect.ts; lib/ui/copy.ts |
| DC-4 | Conversation | A sequence of questions and answers in one session, so a follow-up such as "how much does it cost?" can be understood. | id, title, time of last turn, turns | Conversation (lib/ui/history.ts); Telegram history (lib/telegram/history.ts) |
| DC-5 | Government Procedure | A public service a citizen can request (for example birth registration or a driving licence), with its steps, documents, fees and deadlines. | name, ministry, steps, documents, fees, deadlines | No type of its own. It exists only as the text of passages in data/kb/\\\*.json. |
| DC-6 | Official Passage | A unit of text published by a ministry that states facts about a procedure. Answers may be built only from passages. It is either approved by a steward or a crawled page that no steward has reviewed. | id, ministry, document, instrument, article, link, effective date, verified date, review-due date, geographic scope, superseded flag, steward-approved flag, origin, text (English and Khmer), keywords, sample questions | Chunk (lib/types.ts); data/kb/\\\*.json; crawl index (lib/retrieval/crawl-index.ts) |
| DC-7 | Official Source | A public online channel where a ministry publishes: a website, a Facebook page, or a Telegram channel. | id, organisation, category, link, host, adapter (web, facebook, telegram), provenance | Source (lib/crawl/types.ts); data/sources.json (registry of 132 sources, README section 8.7) |
| DC-8 | Answer | The reply to a question: steps, documents, fees, deadlines and hours from a source, or a plain statement that the system cannot answer. | id, tier, language, text, citations, coverage-gap flag, unverified flag, unreviewed flag, terminal flag | AskResponse (lib/types.ts) |
| DC-9 | Answer Tier | How an answer was produced: Tier 1 curated answer, Tier 2 retrieval and generation, Tier 3 refusal. | tier number (1, 2, 3) | type Tier; lib/engine/tiers.ts |
| DC-10 | Curated Answer (with Glossary Term) | A human-approved answer, or the plain-language meaning of an official term, served word for word with no generation. | match phrases, approved text; term, definition (English and Khmer) | data/curated.json, data/glossary.json; lib/engine/curated.ts, lib/engine/glossary.ts |
| DC-11 | Citation | The reference that shows which official source supports an answer, kept visually separate from the answer text. | ministry, document, instrument, article, link, effective date, verified date, review-due date, freshness, quote, unreviewed flag | Citation (lib/types.ts); lib/engine/citations.ts |
| DC-12 | Freshness | How current a passage is compared with its review date: fresh, due or stale. | state, review-due date | type Freshness; lib/engine/freshness.ts; FreshnessBadge.tsx |
| DC-13 | Ministry / Responsible Office | The public institution that publishes and handles procedures. | name (English and Khmer), registered sources, parent ministry | Fields on Chunk and Source. No type of its own. |
| DC-14 | Facility (Office Contact Information) | A public office where a citizen goes: its address, hours and phone, plus national emergency numbers. | id, ministry, name (English and Khmer), services, province, address, hours, phone | Facility (lib/kb/loader.ts); data/facilities.json (sample entries) |
| DC-15 | Messaging Channel | The way the citizen reaches the system: the web chat, Telegram, or Messenger. | platform | app/chat, app/api/telegram/webhook, lib/ui/channels.ts |
| DC-16 | Popular Procedure | A commonly requested topic offered as a shortcut, so the citizen can pick it instead of typing. | label (English and Khmer), question text | SUGGESTIONS (lib/ui/copy.ts); TOPICS (lib/ui/landing.ts) |
| DC-17 | Refusal Policy | The rules for what the system will not answer (for example emergencies, legal advice, politics, off-domain questions). It screens each question before retrieval and checks each answer afterwards. | kind, response text | lib/engine/guardrails.ts |
| DC-18 | Feedback Report | A citizen's report that an answer was incorrect, helpful or unhelpful. | answer id, kind, comment (redacted), cited passage ids, ministries | FeedbackRecord (lib/log/audit.ts); app/api/feedback |
| DC-19 | Change Signal | A difference found on an official source, raised to a steward for review. Nothing from a crawl enters data/kb without approval. | source, detected change, risk class | ChangeSignal (lib/crawl/types.ts); review-queue.jsonl (lib/crawl/store.ts) |
| DC-20 | Crawl Report | The summary of one crawl run. | run totals | CrawlReport (lib/crawl/types.ts); saveReport (lib/crawl/store.ts) |

External actors that are not domain concepts: the **Steward** (a person who approves content and handles reports), the **Scheduler** (the schedule scripts that start a crawl), and the **AI Model Service**. Their goals are given in Section 4a.

  

6b. Associations

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Concept A\*\* | \*\*Association\*\* | \*\*Concept B\*\* | \*\*Multiplicity\*\* |
| Citizen | submits | Question | 1 to 0..\\\* |
| Citizen | reaches the system through | Messaging Channel | 1 to 1..\\\* |
| Citizen | picks | Popular Procedure | 1 to 0..\\\* |
| Question | is written in | Language | 0..\\\* to 1 |
| Question | belongs to | Conversation | 0..\\\* to 1 |
| Question | is screened by | Refusal Policy | 0..\\\* to 1 |
| Question | is answered by | Answer | 1 to 1 |
| Question | is about | Government Procedure | 0..\\\* to 0..1 |
| Answer | is produced at | Answer Tier | 0..\\\* to 1 |
| Answer | is copied from (Tier 1) | Curated Answer | 0..\\\* to 0..1 |
| Answer | is based on (Tier 2) | Official Passage | 0..\\\* to 0..\\\* |
| Answer | is supported by | Citation | 1 to 0..\\\* (none for a Tier 3 refusal) |
| Citation | refers to | Official Passage | 1 to 1 |
| Official Passage | has | Freshness | 1 to 1 |
| Government Procedure | is described by | Official Passage | 1 to 1..\\\* |
| Government Procedure | is handled by | Ministry / Responsible Office | 0..\\\* to 1 |
| Official Passage | is published on | Official Source | 0..\\\* to 1 |
| Official Source | belongs to | Ministry / Responsible Office | 0..\\\* to 1 |
| Ministry / Responsible Office | runs | Facility | 1 to 0..\\\* |
| Feedback Report | concerns | Answer | 0..\\\* to 1 |
| Change Signal | is detected on | Official Source | 0..\\\* to 1 |
| Change Signal | replaces (when approved) | Official Passage | 0..1 to 1 |
| Crawl Report | summarises a run over | Official Source | 1 to 0..\\\* |

Figure 6-1. Domain model diagram showing DC-1 to DC-20 with the associations above.

  

6c. Concept Responsibilities and Reasoning

**Asking and answering (DC-1 to DC-4, DC-8, DC-9, DC-15, DC-16).** A Citizen submits a Question through a Messaging Channel. Language is a concept of its own because it affects the question, the answer and the interface. Conversation is separate from Question because a follow-up (UC-8) can only be understood with earlier turns. Answer Tier records how each answer was produced, so a curated answer can be told apart from a generated one and from a refusal. Popular Procedure exists so the citizen does not have to know how to phrase a question (REQ-9, REQ-35).

**Knowledge that answers may use (DC-5, DC-6, DC-7, DC-10, DC-13, DC-14).** An answer may rest only on official content (REQ-4, REQ-5, REQ-7). Official Passage carries its provenance (ministry, instrument, article, dates) and Official Source says where it came from. Curated Answer holds text that a person has already approved. Ministry and Facility cover the second main need of the citizen, which is where to go (REQ-11 to REQ-13).

**Trust and safety (DC-11, DC-12, DC-17, DC-18).** Citation is separate from Answer because REQ-28 and REQ-34 require the source to be shown apart from the answer text. Freshness warns the citizen when a source is past its review date. Refusal Policy keeps the system from answering what it must not answer. Feedback Report lets a citizen challenge an answer.

**Keeping content current (DC-19, DC-20).** Change Signal and Crawl Report come from UC-11. A change found by a crawl is not trusted until a steward approves it.

  

6d. Review of the Domain Analysis against Reports One and Two and the repository

|  |  |
| :-: | :-: |
| \*\*Check\*\* | \*\*Result\*\* |
| Every use case (UC-1 to UC-11) uses at least one concept | Yes, shown in Matrix 2 (6f). |
| Every concept is used by at least one use case | Yes. DC-1 to DC-20 each appear in Matrix 2. |
| Concepts added because the code has them but Report Two does not | DC-9 Answer Tier, DC-10 Curated Answer, DC-12 Freshness, DC-17 Refusal Policy. |
| Concepts in Report One that are only partly built | DC-14 Facility (sample data, used for emergency numbers only) and DC-15 Messenger (link only). |
| Concepts with no type of their own in the code | Government Procedure, Ministry, Popular Procedure, Question. They appear as fields or constants inside other types. |

 

6e. Traceability Matrix 1: Use Cases to System Requirements

This matrix reads from each use case to the requirements it satisfies. It is the reverse view of the matrix in Section 4, 3c-iii. The priority weight (PW) of a use case is the sum of the weights of the requirements it covers. Each PW equals the value in the "Max PW" row of 3c-iii, so the two matrices agree. The last column states what the repository implements.

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| \*\*Use case\*\* | \*\*Name\*\* | \*\*Requirements satisfied\*\* | \*\*PW\*\* | \*\*Status in the repository\*\* |
| UC-1 | AskQuestion | REQ-1, REQ-2, REQ-3, REQ-5, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-31, REQ-32, REQ-33 | 58 | Implemented: ask() in lib/engine/tiers.ts, called by app/api/ask and the chat components. |
| UC-2 | RetrieveOfficialSources | REQ-4, REQ-5, REQ-8 | 15 | Implemented: retrieve() in lib/retrieval/index.ts (keyword and vector search, rank fusion, rerank). |
| UC-3 | ViewSourceCitation | REQ-6, REQ-28, REQ-34 | 14 | Implemented: toCitation() and SourceCard.tsx. |
| UC-4 | DeclineUnsupportedQuestion | REQ-7 | 5 | Implemented as Tier 3 refusal, with a confidence floor before generation and a verification gate after it. |
| UC-5 | BrowsePopularProcedures | REQ-9, REQ-35 | 8 | Implemented: SUGGESTIONS in lib/ui/copy.ts. |
| UC-6 | ViewRecentConversations | REQ-10, REQ-36 | 7 | Implemented: lib/ui/history.ts and Sidebar.tsx (20 conversations in the browser). |
| UC-7 | GetOfficeContactAndLocation | REQ-11, REQ-12, REQ-13, REQ-20, REQ-38, REQ-39 | 24 | Partial: office details come from passage text. The Facility directory holds sample data and is used for emergency numbers only. No map link. |
| UC-8 | AskFollowUpQuestion | REQ-14 | 4 | Implemented: earlier turns are passed with each request and used to rewrite the follow-up. |
| UC-9 | AskThroughMessagingChannel | REQ-15 | 3 | Telegram implemented (webhook and lib/telegram). Messenger is a link only. |
| UC-10 | SwitchLanguage | REQ-2, REQ-37 | 9 | Implemented: Khmer and English interface text in lib/ui/copy.ts. |
| UC-11 | RefreshOfficialContent | REQ-4, REQ-8, REQ-29, REQ-30 | 18 | Partial: web adapter only; run by script, not by a server timer. Change signals go to a review queue. |

**Explanation.** UC-1 carries the most weight (58) because it holds the core of the product: the chat input and submission, the answer, and the content of the answer (steps, documents, fees, deadlines, hours). UC-7 (24) is second because contact and location make up the second main goal of the system. UC-11 (18) has a high weight although the citizen never sees it, because REQ-29 and REQ-30 (content can be updated and ministries added without redesign) depend on it. UC-4 (5), UC-8 (4) and UC-9 (3) each trace to one requirement, but they extend or wrap UC-1, so UC-1's tests also cover them.

**Coverage check.** Every functional and user-interface requirement (REQ-1 to REQ-20 and REQ-28 to REQ-39) is satisfied by at least one use case. Five requirements are satisfied by more than one: REQ-2 (UC-1, UC-10), REQ-4 and REQ-8 (UC-2, UC-11), REQ-5 (UC-1, UC-2) and REQ-20 (UC-1, UC-7). This is intended: UC-2 runs inside UC-1, and UC-11 builds the content that UC-2 searches.

**Nonfunctional requirements REQ-21 to REQ-27.** These are qualities of the whole system and are verified by testing, not by one use case. The table links each to the use case where it is most visible and to the check in the repository.

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Requirement\*\* | \*\*Quality\*\* | \*\*Most visible in\*\* | \*\*Check in the repository\*\* |
| REQ-21 | Users can submit a question unaided (90%) | UC-1 | Usability test with users (not a script) |
| REQ-22 | No unsupported claim in a sourced answer | UC-1, UC-3 | npm run verify-check (the verification gate blocks fabricated figures); tests/engine/verify.test.ts |
| REQ-23 | At least 95% of unsupported questions refused | UC-4 | npm run eval and npm run scope-check. A comment in lib/engine/tiers.ts records 91.2% of in-scope answered and 100% of out-of-scope refused on the starter set. |
| REQ-24 | Response starts within 5 seconds for 90% of queries | UC-1 | latencyMs in the diagnostics of each answer |
| REQ-25 | Usable from about 360 px wide, no horizontal scroll | UC-1 to UC-10 (interface) | Manual responsive check |
| REQ-26 | Khmer and English display correctly | UC-1, UC-10 | Manual browser check; tests/khmer |
| REQ-27 | Secrets stay server-side | All citizen-facing use cases | API keys are read only in server routes (app/api); check that no key reaches the client bundle |

 

6f. Traceability Matrix 2: Use Cases to Domain Concepts

A cell marked X means the use case uses or changes that concept. (X) means the link is only partly built in the repository. Concept codes are defined in 6a: DC-1 Citizen, DC-2 Question, DC-3 Language, DC-4 Conversation, DC-5 Government Procedure, DC-6 Official Passage, DC-7 Official Source, DC-8 Answer, DC-9 Answer Tier, DC-10 Curated Answer, DC-11 Citation, DC-12 Freshness, DC-13 Ministry / Responsible Office, DC-14 Facility, DC-15 Messaging Channel, DC-16 Popular Procedure, DC-17 Refusal Policy, DC-18 Feedback Report, DC-19 Change Signal, DC-20 Crawl Report.

|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| \*\*Use case\*\* | \*\*DC-1\*\* | \*\*DC-2\*\* | \*\*DC-3\*\* | \*\*DC-4\*\* | \*\*DC-5\*\* | \*\*DC-6\*\* | \*\*DC-7\*\* | \*\*DC-8\*\* | \*\*DC-9\*\* | \*\*DC-10\*\* | \*\*DC-11\*\* | \*\*DC-12\*\* | \*\*DC-13\*\* | \*\*DC-14\*\* | \*\*DC-15\*\* | \*\*DC-16\*\* | \*\*DC-17\*\* | \*\*DC-18\*\* | \*\*DC-19\*\* | \*\*DC-20\*\* |
| UC-1 AskQuestion | X | X | X | X | X | X |   | X | X | X | X | X |   |   | X |   | X |   |   |   |
| UC-2 RetrieveOfficialSources |   | X | X |   | X | X | X |   |   |   |   |   |   |   |   |   |   |   |   |   |
| UC-3 ViewSourceCitation |   |   |   |   |   | X | X | X |   |   | X | X | X |   |   |   |   | X |   |   |
| UC-4 DeclineUnsupportedQuestion |   | X | X |   |   |   |   | X | X |   |   |   |   |   |   |   | X |   |   |   |
| UC-5 BrowsePopularProcedures | X | X |   |   | X |   |   | X |   |   |   |   |   |   |   | X |   |   |   |   |
| UC-6 ViewRecentConversations | X | X |   | X |   |   |   | X |   |   |   |   |   |   |   |   |   |   |   |   |
| UC-7 GetOfficeContactAndLocation | X | X |   |   |   | X |   | X |   |   | X |   | X | (X) |   |   |   |   |   |   |
| UC-8 AskFollowUpQuestion | X | X |   | X | X |   |   | X |   |   |   |   |   |   |   |   |   |   |   |   |
| UC-9 AskThroughMessagingChannel | X | X | X |   |   |   |   | X |   |   | X |   |   |   | X |   |   |   |   |   |
| UC-10 SwitchLanguage | X |   | X |   |   |   |   | X |   |   |   |   |   |   |   |   |   |   |   |   |
| UC-11 RefreshOfficialContent |   |   |   |   |   | X | X |   |   |   |   | X | X |   |   |   |   |   | X | X |

**Explanation.** UC-1 touches the most concepts (thirteen) because it is the whole path from question to answer. A Citizen sends a Question in a Language. The refusal policy screens it. A curated answer is tried first (Tier 1), then Official Passages about a Government Procedure are retrieved (Tier 2). The system returns an Answer with a Citation and a Freshness label, and the turn is added to the Conversation. UC-2 and UC-3 are the two halves of trust. UC-2 concerns what an answer may use (Passages and their Official Source). UC-3 concerns what the citizen sees (Citation, Freshness, the Ministry, and the Feedback Report that can be sent from the citation card). UC-4 ends in Tier 3: a refusal is an Answer of a different tier, given in the language of the question after the Refusal Policy or the confidence floor applied. UC-5, UC-6 and UC-8 are other ways of reaching the same Question and Answer: a Popular Procedure shortcut, a stored Conversation, or a follow-up that depends on earlier turns. UC-7 is the only use case that uses the Facility concept, and that link is partial because the Facility directory holds sample data; office details are today read from passage text. UC-9 differs from UC-1 only in the Messaging Channel. UC-10 changes the Language only. UC-11 is the only use case that touches Change Signal and Crawl Report, and it does not use Question or Answer, which is why it runs as a separate process from the citizen-facing flows.

**Check of the matrix.** Every column has at least one X, so every concept is used by a use case. DC-10, DC-14, DC-16, DC-18, DC-19 and DC-20 each appear in exactly one use case, which shows they are specialised concepts. DC-8 Answer appears in nine use cases and DC-2 Question in eight, because every citizen-facing flow ends in an answer to a question. Crawled pages can be served as unreviewed passages at answer time (UC-1, UC-2), so UC-2 also depends on DC-7 for runtime content, not only for the refresh in UC-11.

6g. Traceability Matrix 3: Classes to Domain Concepts

This matrix reads from each design class in Section 8 to the domain concepts it implements, and to the code that implements it. The relationship is one of three kinds. **Direct**: the class is the concept. **Realisation**: the class implements one part or one variant of a concept. **Support**: the class belongs to the design (a controller, a service, a boundary or a provider) and implements no single concept, but works on the concepts listed. The class names are those in Report Two, Section 8 (37 names, plus the Turn type used by Conversation). Status is Implemented, Partial or Planned.

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| \*\*Report Two class\*\* | \*\*Implemented as (repository)\*\* | \*\*Domain concept(s)\*\* | \*\*Relationship\*\* | \*\*Status\*\* |
| ChatUI | components/chat (Chat, Composer, Sidebar, AnswerBlock, SourceCard, ReportDialog, FreshnessBadge) | DC-15 (web chat), DC-16, DC-3 | Realisation | Implemented |
| TelegramBot | app/api/telegram/webhook, lib/telegram | DC-15 (Telegram) | Realisation | Implemented |
| QAController | ask() in lib/engine/tiers.ts; app/api/ask | DC-2, DC-8, DC-9 | Support | Implemented |
| RefreshController | crawl() in lib/crawl/crawl.ts; scripts/crawl.ts and the schedule scripts | DC-19, DC-20 | Support | Implemented (started by script) |
| LanguageService | lib/lang/detect.ts, lib/khmer | DC-3 | Direct (behaviour) | Implemented |
| RetrievalService | retrieve() in lib/retrieval/index.ts, rrf.ts, rerank.ts | DC-6 | Support | Implemented |
| SearchIndex | No interface; retrieval combines both indexes | DC-6 | Realisation | Implemented as a module |
| KeywordIndex | Bm25Index (lib/retrieval/bm25.ts) | DC-6 | Realisation | Implemented |
| VectorIndex | VectorIndex (lib/retrieval/embed.ts) | DC-6 | Realisation | Implemented |
| Candidate | Candidate (lib/types.ts) | DC-6 | Realisation | Implemented |
| ContentStore | Kb and getKb() (lib/kb/loader.ts); crawl-index.ts | DC-5, DC-6 | Direct | Implemented |
| Passage | Chunk (lib/types.ts) | DC-6 | Direct | Implemented |
| Question | AskRequest (lib/types.ts) | DC-2 | Direct | Implemented as a field, not a class |
| Conversation | Conversation (lib/ui/history.ts) | DC-4 | Direct | Implemented |
| Turn (type) | StoredTurn (lib/ui/history.ts) | DC-4 | Realisation | Implemented |
| ConversationHistory | loadAll, save, remove, clearAll (lib/ui/history.ts); lib/telegram/history.ts | DC-4 | Direct | Implemented (browser storage and memory) |
| AIModelGateway | generate() in lib/llm/index.ts, gateway.ts | DC-8 | Support | Implemented |
| LlmProvider | LlmProvider (lib/llm/provider.ts) | DC-8 | Support | Implemented |
| AnthropicProvider | lib/llm/anthropic.ts | DC-8 | Support | Implemented |
| SeaLionProvider | lib/llm/sealion.ts (and vllm.ts) | DC-8 | Support | Implemented |
| ExtractiveProvider | lib/llm/extractive.ts | DC-8 | Realisation | Implemented |
| AnswerVerifier | verify() in lib/engine/verify.ts | DC-8, DC-11, DC-6 | Support | Implemented |
| Answer | AskResponse (lib/types.ts) | DC-8, DC-9 | Direct | Implemented |
| SourceCitation | Citation (lib/types.ts); toCitation() in lib/engine/citations.ts | DC-11, DC-12 | Direct | Implemented |
| CitationPresenter | SourceCard.tsx, FreshnessBadge.tsx | DC-11, DC-12 | Support | Implemented |
| FeedbackLog | recordFeedback and recordAnswer (lib/log/audit.ts); app/api/feedback | DC-18 | Direct | Implemented |
| Report | FeedbackRecord (lib/log/audit.ts) | DC-18 | Direct | Implemented |
| OfficeDirectory | facilities in Kb (lib/kb/loader.ts); data/facilities.json | DC-13, DC-14 | Direct | Partial: sample data, used for emergency numbers only |
| ContactInfo | Facility (lib/kb/loader.ts) | DC-14 | Direct | Partial: sample data |
| SourceRegistry | loadSources() in lib/crawl/crawl.ts; data/sources.json | DC-7, DC-13 | Direct | Implemented |
| RegisteredSource | Source (lib/crawl/types.ts) | DC-7 | Direct | Implemented |
| SourceCrawler | Adapter type (lib/crawl/types.ts) | DC-7 | Realisation | Implemented as a type |
| WebsiteCrawler | web adapter in lib/crawl (fetch, extract, robots, soft-block) | DC-7 | Realisation | Implemented |
| FacebookCrawler | None | DC-7 | Realisation | Planned |
| TelegramCrawler | None | DC-7 | Realisation | Planned |
| ReviewQueue | raiseToQueue() in lib/crawl/store.ts (review-queue.jsonl) | DC-19 | Direct | Implemented |
| ChangeSignal | ChangeSignal (lib/crawl/types.ts) | DC-19 | Direct | Implemented |
| RefreshReport | CrawlReport; saveReport() (lib/crawl) | DC-20 | Direct | Implemented |

  

 These modules carry domain concepts that the Report Two class diagram does not show.

|  |  |  |
| :-: | :-: | :-: |
| \*\*Code\*\* | \*\*Domain concept(s)\*\* | \*\*Why it matters\*\* |
| lib/engine/guardrails.ts (screen, moderateOutput) | DC-17 | Runs before retrieval, so an out-of-scope question never reaches a model. |
| lib/engine/curated.ts, lib/engine/glossary.ts | DC-10, DC-9 | The Tier 1 path: answers served word for word. |
| lib/engine/freshness.ts | DC-12 | Sets fresh, due or stale from the review date. |
| lib/engine/topicality.ts, rationale.ts | DC-8, DC-9 | Decide whether sources really cover the question and whether a why-question can be answered. |
| lib/engine/crawl-answer.ts, fallback.ts | DC-6, DC-8 | Serve an unreviewed crawled page, or an unverified general answer when the operator switch is on. Both are labelled. |
| lib/log/trace.ts (class AskTrace) | None | Diagnostics only. |

**Explanation.** Most classes trace to a concept either directly or as one variant of it. Three patterns explain the rest. First, **boundary and control classes** (ChatUI, TelegramBot, QAController, RefreshController) are entry points the design needs, not things in the citizen's world, so the table links them to the concepts they carry. Second, **interface families** (SearchIndex, LlmProvider, SourceCrawler) are the places where a search method, model vendor or source platform can change (REQ-29, REQ-30), so one concept maps to several classes. In the code these are modules and a type rather than interfaces everywhere. Third, **concepts without a type of their own**: Citizen (a person), Government Procedure (it exists only as the text of passages held by the content store), Ministry and Popular Procedure (a field and a constant list).

**Check.** Every Report Two class maps to at least one concept, and every concept except DC-1 maps to at least one class or module, so there are no orphan classes. Four classes have no working implementation: FacebookCrawler and TelegramCrawler (planned) and, in effect, OfficeDirectory and ContactInfo (sample data only). The Report Two matrix "Traceability (2): design classes to use cases" still holds and shows the same classes against use cases.

  
  

### **7. Interaction Diagrams**

The interaction diagrams below refine the five use cases that were fully dressed in Report One (Sections 3c-iv and 3d): UC-1 AskQuestion, UC-2 RetrieveOfficialSources, UC-3 ViewSourceCitation, UC-7 GetOfficeContactAndLocation, and UC-11 RefreshOfficialContent. Where the system sequence diagrams in Report One treated SuperAsk.AI as a single black box, the sequence diagrams here open that box into design objects and show how responsibilities are assigned to them. The diagrams illustrate how responsibilities are assigned to different system components using the GRASP design principles discussed in the course lectures (Section 2.5.1). These principles are explained through the interactions between objects and summarized below each diagram. The diagrams also show alternative flows for situations such as insufficient information, unavailable services, and content verification.

**  
****Design principles employed in assigning responsibilities.** Four decisions shape all five diagrams. First, each use case has a single **Controller** (QAController for the citizen-facing flows, RefreshController for the scheduled refresh) that receives system events, so boundary objects such as :ChatUI stay free of business logic. Second, responsibilities are placed with the object that has the information needed to fulfil them (**Information Expert**): ContentStore decides what content is currently in effect, ConversationHistory resolves follow-up references, SourceRegistry knows the registered sources, and OfficeDirectory answers contact questions. Third, work that fits no domain object cleanly is factored into cohesive service classes (**Pure Fabrication**, **High Cohesion**): LanguageService, RetrievalService, AnswerVerifier, CitationPresenter. Fourth, points where change is expected are wrapped behind stable interfaces (**Protected Variations**, **Indirection**, **Polymorphism**): AIModelGateway hides the external AI model vendor, SearchIndex hides the search method, and SourceCrawler hides the source platform, which is what lets REQ-29/REQ-30 hold without redesigning the core.

  
  
  
  
  
  
  
  

**UC-1: AskQuestion**

*Figure 12: Sequence diagram for UC-1: AskQuestion.*

Design principles: the responsibility for handling the user's events is assigned to QAController (**Controller**), which keeps :ChatUI a thin boundary object with no business logic (**Low Coupling**). Khmer/English handling and claim verification are factored into LanguageService and AnswerVerifier (**Pure Fabrication**, **High Cohesion**). AIModelGateway isolates the external AI Model Service behind one interface, so swapping the model vendor changes only that class (**Indirection**, **Protected Variations**). AnswerVerifier assembles the final Answer with its citations because it already works with all the data the Answer needs (**Creator**), and ConversationHistory stores the exchange because it owns the conversation data (**Information Expert**).

The diagram also shows how the system handles different outcomes when processing a question. If a matching approved answer is available, the system can return it directly. When the retrieved information is insufficient, the system declines to answer rather than providing unsupported information. If the AI model is unavailable, the system can use an extractive fallback to provide information from the retrieved official sources.

  

**UC-2: RetrieveOfficialSources**

*Figure 13: Sequence diagram for UC-2: RetrieveOfficialSources**.*

Design principles: RetrievalService is a **Pure Fabrication** that keeps all retrieval logic in one cohesive class and shields QAController from the indexes and the content store (**Low Coupling**, **Indirection**). KeywordIndex and VectorIndex implement a single SearchIndex interface (**Polymorphism**), so a new search method can be added without touching RetrievalService (**Protected Variations**). ConversationHistory supplies the context for rewriting follow-up questions, and ContentStore decides which passages are still in effect, because each owns exactly that data (**Information Expert**).

The diagram shows how the system processes retrieval results and handles follow-up questions. When a user asks a follow-up question, ConversationHistory provides previous conversation context to help interpret the request. RetrievalService combines keyword and vector search results and filters them against approved government content. If the results do not meet the required relevance threshold, the system returns no relevant passages.

**UC-3: ViewSourceCitation**

*Figure 14: Sequence diagram for UC-3: ViewSourceCitation.*

Design principles: the Answer object supplies its own SourceCitation list, so no other object needs to dig through its structure (**Information Expert**). CitationPresenter is a **Pure Fabrication** whose single responsibility is rendering source cards visually separate from the answer text (**High Cohesion**, REQ-28). FeedbackLog creates and stores the Report record when the user flags an answer, so the UI only forwards the event (**Creator**, **Low Coupling**).

The diagram also illustrates how official sources are presented to users separately from the generated answer. CitationPresenter organizes the source information and identifies citations that may require review. Users can open the provided source links to verify the information or report an incorrect answer through the feedback function. This supports transparency and helps identify information that may need correction.

**UC-7: GetOfficeContactAndLocation**

*Figure 15: Sequence diagram for UC-7: GetOfficeContactAndLocation.*

Design principles: QAController again acts as the use-case **Controller**, keeping lookup logic out of the UI. ConversationHistory resolves what “this” refers to because it holds the earlier conversation (**Information Expert**). OfficeDirectory manages the available office contact and location records, currently loaded from data/facilities.json. It is responsible for identifying the correct office and returning verified information without guessing (**Information Expert, High Cohesion**, REQ-13/REQ-39).

The diagram shows two possible outcomes when users request office contact information. If verified contact information is available, the system provides the office details with the supporting source. If no verified online contact information exists, the system informs the user and provides a verified office location when available. This allows users to receive useful information without presenting unverified contact details as official information.

**UC-11: RefreshOfficialContent**

*Figure 16: Sequence diagram for UC-11: RefreshOfficialContent.*

Design principles: RefreshController handles the Scheduler's system event and coordinates the run (**Controller**). SourceRegistry owns the registered source list, so adding a new ministry is just a new registry entry with no change to the rest of the system (**Information Expert**, REQ-30). The platform crawlers (website, Facebook, Telegram) implement one SourceCrawler interface, so a new platform never changes RefreshController (**Polymorphism**, **Protected Variations**). Changed content is queued for a human steward to review — the crawler never writes to the knowledge base directly. ContentStore creates and versions the approved content records because it aggregates them (**Creator**, **Information Expert**), and RefreshController creates the RefreshReport from the results it holds (**Creator**).

The diagram illustrates how the system handles content updates from official government sources. During the refresh process, the system checks for new or modified information and places detected changes in a review queue. A human content steward reviews the changes before they are added to the approved content store. If the retrieval process fails, the existing content is preserved. This process helps prevent unverified information from being used in generated answers.

### **8. System Architecture and System Design**

1.  **Identifying Subsystems** 

<!-- end list -->

1.  **UML Package Diagram** 

*Figure 17: UML Package Diagram.*

1.  **Description of Subsystems** 

**1. Presentation Subsystem (Client Tier):**

  - Responsibility: Provides the responsive, bilingual (English & Khmer) user interface for citizens.
  - Key Modules: Web Chat page (/chat), landing page, UI components (components/) including message history, source citation cards, verification badges, and developer trace panels. It also powers the Telegram Mini App view.

**2. API Gateway & Controller Subsystem:**

  - Responsibility: Serves as the public entry point for incoming network traffic.
  - Key Modules: Next.js App Router endpoints (/api/ask, /api/feedback, /api/health, and /api/telegram). It handles JSON payload validation, CORS, rate limits, and dispatching to backend pipelines.

**3. Natural Language Processing (NLP) Subsystem:**

  - Responsibility: Resolves linguistic challenges specific to Khmer and mixed-language citizen queries.
  - Key Modules: lib/khmer/ (Unicode normalisation, zero-width space canonical reordering, dictionary-based segmentation, and Romanised-Khmer transliteration mapping) and lib/lang/ (language identification between km and en).

**4. Retrieval & Knowledge Subsystem:**

  - Responsibility: Manages domain knowledge and retrieves authoritative legal provisions without hallucinations.
  - Key Modules: lib/retrieval/ implementing hybrid search (lexical BM25 + dense vector embeddings) fused through Reciprocal Rank Fusion (RRF) and cross-encoder reranking; lib/kb/ containing legal chunks, sub-decrees, and ministry documents; and data/glossary.json for official government terminology.

**5. Core Orchestration & Policy Guardrail Subsystem:**

  - Responsibility: The central brain executing the safety and answer pipeline.
  - Key Modules:
      
      - Tier Routing (lib/engine/tiers.ts): Routes to Tier 1 (Curated FAQ / Glossary), Tier 2 (RAG grounded answer), or Tier 3 (Withhold & Decline).
      - Guardrails (lib/engine/guardrails.ts): Enforces strict refusal policies on emergency calls, legal dispute advice, political queries, and out-of-scope tasks.
      - Verification Gate (lib/engine/verify.ts): Cross-checks generated figures, fees, and dates against retrieved source texts before showing them to the citizen.

**6. Model Integration Subsystem (LLM Abstraction):**

  - Responsibility: Encapsulates language model providers behind a uniform interface.
  - Key Modules: lib/llm/anthropic.ts (invoking Claude models) and lib/llm/extractive.ts (a deterministic, zero-cost extractive provider that quotes retrieved text verbatim when API credentials are absent or fail).

**7. Audit & Governance Subsystem:**

  - Responsibility: Maintains system integrity, security, and continuous legal compliance.
  - Key Modules: Append-only query audit logger with automatic PII redaction (lib/log/) and content monitoring (lib/crawl/, lib/registry/) that checks source ministries for stale or updated regulations.

  

1.  **Architecture Styles** 

The system combines four primary architectural styles to satisfy high availability, bilingual processing, safety guardrails, and cloud deployment:

1.  **Client-Server Architecture**

<!-- end list -->

  - Description: Separates user interface presentation from core processing logic and data storage.
  - Application in System:
  - Client: Web browsers and the Telegram Mini App render the visual chat interface, accept user input, manage local session states, and display citations.
  - Server: The Next.js Node.js / Serverless runtime processes requests, runs NLP, queries knowledge databases, and interfaces with AI models.
  - Advantage: Allows multi-platform access (web, mobile, Telegram) while keeping sensitive knowledge data and LLM secrets securely on the server.

<!-- end list -->

1.  **Layered (N-Tier) Architecture**

<!-- end list -->

  - Description: Structures software into distinct horizontal layers where each layer has a dedicated responsibility and only communicates with adjacent layers.
  - Application in System:
  - Presentation Layer: React UI components, chat interfaces, and theme providers.
  - API / Controller Layer: Next.js App Router API endpoints (/api/ask, /api/telegram).
  - Domain / Orchestration Layer: Guardrails, tier router, verification gate, and citation builder.
  - Service & Retrieval Layer: Khmer text segmentation, BM25 / RRF hybrid search, and LLM abstraction adapters.
  - Data / Knowledge Layer: Legal chunk registry, glossary entries, and append-only audit files.
  - Advantage: High modularity, ease of testing (600+ automated unit/integration tests), and separation of concerns.

<!-- end list -->

1.  **Pipeline / Pipes-and-Filters Architecture (RAG Pipeline)**

<!-- end list -->

  - Description: Data flows sequentially through a chain of processing components (filters), where the output of one component serves as the input to the next.
  - Application in System: The Ask Engine follows a strict, verifiable linear processing pipeline: Query Input → Unicode Normalisation → Policy Guardrails → Curated Answer Match → Hybrid Retrieval → Confidence Gate → Prompt Assembly → LLM Generation → Verification Gate → Citation Linking → Final Response
  - Advantage: If any filter fails (e.g., policy filter flags an emergency query, or the verification gate detects an unverified fee), execution halts immediately and routes to a safe fallback or decline without executing subsequent costly steps.

<!-- end list -->

1.  **Adapter / Facade Pattern (Service-Oriented Integration)**

<!-- end list -->

  - Description: Provides unified wrapper interfaces around heterogeneous external systems.
  - Application in System:
  - lib/llm/ provides a pluggable provider interface hiding whether answers are generated via Anthropic Claude API or via the local Deterministic Extractive Fallback.
  - lib/telegram/ provides an adapter bridging the Telegram Bot Webhook API into internal standard AskRequest contracts.

<!-- end list -->

1.  **Mapping Subsystems to Hardware** 

The system is a distributed cloud application that executes across multiple independent physical and virtual machines. The subsystem names used in the table and in the deployment diagram are the seven subsystems defined in Section 3a; each subsystem is assigned to exactly one machine, and the connectors between the machines are described in Section 3d. 

  
  

**Hardware Mapping Table**

|  |  |  |
| :-: | :-: | :-: |
| \*\*Hardware Machine / Environment\*\* | \*\*Description & Infrastructure\*\* | \*\*Subsystems Running on this Machine\*\* |
| \*\*Machine 1: Client Tier (End-User Devices)\*\* | Citizen smartphones, tablets, laptops, and desktop computers. | • Presentation Subsystem (Web Browser, React 19 / Next.js Client Bundle) • Telegram Client / Mini App container UI |
| \*\*Machine 2: Application Server (current deployment: Vercel serverless Node.js; proposed production: GCP Cloud Run / Compute Engine, see Section 3f)\*\* | Distributed serverless edge and Node.js compute instances hosted in the cloud. | • API Gateway & Controller Subsystem (/api/\\\*) • Natural Language Processing (NLP) Subsystem • Core Orchestration & Policy Guardrail Subsystem • Retrieval & Knowledge Subsystem (in-memory indexes over the static knowledge base) • Model Integration Subsystem (LLM adapters, which call Machine 3) • Audit & Governance Subsystem: audit logging with PII redaction (its content-monitoring part runs on Machine 5) |
| \*\*Machine 3: External AI Platform (Anthropic GPU Cloud Cluster)\*\* | High-performance AI hardware acceleration clusters (GPU/TPU clusters managed by Anthropic). | • Foundation LLM inference (Claude models), called over HTTPS by the Model Integration Subsystem on Machine 2 |
| \*\*Machine 4: Messaging Cloud Server (Telegram Cloud Infrastructure)\*\* | Worldwide distributed messaging servers managed by Telegram. | • Telegram Bot API server and webhook relay, connecting the Telegram client on Machine 1 to the API Gateway & Controller Subsystem on Machine 2 |
| \*\*Machine 5: Content-Monitoring Workstation (team computer)\*\* | Windows PC with \[Node.js\](http://node.js) 24 that runs the weekly crawl as a scheduled task (Sunday 02:00 ICT) in a separate process from the web server; it reaches the official sources over HTTP(S). | • Audit & Governance Subsystem, content-monitoring part (lib/crawl, lib/registry): started by the Scheduler, it raises change signals to the review queue and never writes to the knowledge base |

**Hardware Deployment Diagram**

*Figure 18: Hardware deployment diagram: the five machines of the hardware mapping table and the connectors between them.*

1.  **Connectors and Network Protocols** 

SuperAsk.AI requires network communication between the user interfaces, backend services, and external platforms. The system currently supports the web application, Telegram bot, and Telegram Mini App, while Messenger integration is planned as an additional communication channel. These interfaces are designed to use the same core question-and-answer system.

The web interface communicates with the backend through a question-and-answer API over HTTPS with JSON bodies (POST /api/ask, POST /api/feedback and GET /api/health); request and response bodies are limited to 4.5 MB by the host. When a user submits a question, QAController coordinates the request, RetrievalService retrieves relevant government information, and AIModelGateway communicates with the external AI model service. The system then returns an answer with supporting source citations. Telegram uses the same backend functionality: the Telegram Bot API delivers each message by HTTPS webhook to POST /api/telegram/webhook, which checks a shared secret, and replies go back through the Bot API over HTTPS; the Mini App is the same /chat page loaded inside Telegram, which the page allows as a frame ancestor. The AI model is called over HTTPS JSON through the Anthropic SDK. Messenger is intended to follow the same webhook approach once integrated.

The system also connects to official government information sources. For the content-refresh process (UC-11), RefreshController coordinates information retrieval from registered government websites, Facebook pages, and Telegram channels through the SourceCrawler interface. The website crawler, the review queue and the weekly scheduled run are implemented today, while the Facebook and Telegram crawlers and the steward-approval portal are planned. The crawler uses HTTP(S) GET with a SuperAskBot user agent, respects robots.txt and waits 2 seconds between requests to the same host. New or updated information is queued as a change signal and must be approved by a steward before being added to the knowledge base. 

These connections allow SuperAsk.AI to support multiple platforms while keeping backend processing separate from the user interfaces. API keys and other sensitive credentials remain on the server side, as required by REQ-27.

1.  **Global Control Flow** 

<!-- end list -->

  - *Execution orderness*

SuperAsk.AI mainly follows an event-driven control flow rather than a fixed linear sequence. The system responds to actions initiated by users, such as submitting questions, viewing source citations, and requesting government office information.

For example, when a user submits a question through the web interface or Telegram, QAController receives the request and coordinates the necessary operations. The system screens the question against the policy guardrails, checks for a curated Tier 1 answer, retrieves relevant information using RetrievalService, applies the confidence gate, generates a response through AIModelGateway, and verifies the answer with AnswerVerifier before presenting it with source citations, the same pipeline order as the class design in Section 2 and the pipes-and-filters style in Section 3b. ConversationHistory supports follow-up questions by maintaining the context of previous interactions.

Users can perform different actions depending on their needs without following the same sequence each time. In addition to user-triggered operations, the system design includes a scheduled content-refresh process controlled by RefreshController. This process is initiated automatically by the Scheduler rather than by a user: it runs as a weekly Windows scheduled task (Sunday 02:00 ICT, scripts/schedule-weekly.ps1) on a team computer, in a separate process from the web server, so the two flows never compete for the same resources.

  - *Time dependency*

SuperAsk.AI is primarily an interactive request-response system and does not have strict real-time execution requirements. However, response time is important because users expect to receive information without unnecessary delays. According to REQ-24, under normal testing conditions, the system should begin displaying a response within 5 seconds for at least 90% of test queries.

The system also includes a periodic content-refresh process (UC-11: RefreshOfficialContent). The Scheduler initiates this process at configured intervals to check registered official sources for updated government information. New or changed content is then reviewed before being added to the approved knowledge base.

Therefore, SuperAsk.AI combines event-driven interactions with a time-based background process. The host caps a web request at 300 seconds and the Telegram webhook at 60 seconds; the 5-second target of REQ-24 is dominated by the model call, since retrieval runs in milliseconds. Although the system has a response-time performance target, it is not classified as a hard real-time system with strict deadlines for every operation.

1.  **Hardware Requirements**

SuperAsk.AI is designed to operate as a web-based application that can be accessed through computers and mobile devices. The system requires client devices, server resources, data storage, and internet connectivity to support communication between users and backend services.

On the client side, users need a computer, laptop, tablet, or smartphone with at least 2 GB of RAM and a 3G, 4G, or Wi-Fi connection. Users can access SuperAsk.AI through a compatible web browser or Telegram, while Messenger is planned as an additional communication channel. According to REQ-25, the web interface should remain usable without horizontal scrolling on screens approximately 360 pixels wide through standard desktop resolutions. The interface must also display Khmer and English text correctly, as specified in REQ-26.

On the server side there are two configurations. The current prototype is deployed on Vercel's serverless platform (Machine 2 in Section 3c): each request runs in a Node.js 24 function with 1 vCPU, 2 GB of RAM and a 300-second limit (60 seconds for the Telegram webhook), the deployment bundle must stay under 250 MB, and the knowledge base (664 KB on disk: 45 approved passages from four organisations and 132 registered sources) is loaded from disk and indexed in memory when a function starts, using well under 100 MB. For the production deployment the team proposes Google Cloud Platform (GCP), with Google Cloud Run or Compute Engine (e2-standard-2) as hosting options. The proposed server configuration includes 2–4 virtual CPUs (vCPUs), 4–8 GB of RAM, and 50 GB of SSD storage using Balanced Persistent Disk. The proposed network configuration includes a 1 Gbps network interface with a minimum dedicated throughput target of 50 Mbps. The preferred hosting region is asia-southeast1 (Singapore) to support connectivity for users in Cambodia. The subsystem mapping in Section 3c does not change between the two configurations: the same Machine 2 subsystems run on either platform.

These resources are intended to support the web application, question-and-answer API, information retrieval, and communication with external AI services. Storage is also needed for government-service information, verified source records, and application data; the audit and feedback logs are append-only files that are not persistent on the serverless host, so the production deployment must keep them in a database or log service. The weekly content-refresh run (Machine 5 in Section 3c) needs a separate team computer with Node.js 24, 2 GB of RAM and about 1 GB of disk that grows with the retained copies of fetched pages (at most 5 MB per page); with a 20-second timeout per request and a 2-second politeness delay per host, the 132 registered sources complete well within the task's 4-hour limit. API keys and other sensitive credentials must remain on the server side, as specified in REQ-27.

### **9. Algorithms and Data Structures**

**a. Algorithms**

Report One did not define a formal mathematical model. Instead, it described the retrieval steps in UC-2: RetrieveOfficialSources (keyword search, meaning-based search, merging and re-ranking the results, and removing outdated content) and the answer checks in UC-1: AskQuestion. The algorithms below implement those steps.

SuperAsk.AI uses several algorithms to process user questions, retrieve relevant government information, and generate responses supported by official sources. These algorithms follow the system architecture described in Section 3 and are represented by the classes and operations in Section 2. The main algorithms support UC-1: AskQuestion, UC-2: RetrieveOfficialSources, and UC-11: RefreshOfficialContent.

**1. Natural Language Processing**

When a citizen submits a question, LanguageService first identifies whether the text is in Khmer or English. The system then normalizes the input, divides it into searchable terms, and expands known synonyms or abbreviations.

For Khmer questions, the system includes Unicode normalization, dictionary-based word segmentation, and Romanized-Khmer mapping. These functions help process questions written in Khmer script, English, or a mixture of both languages.

For example, a citizen may use the abbreviation "MPWT" instead of "Ministry of Public Works and Transport." The system can expand the abbreviation to improve the retrieval of relevant government information.

This algorithm supports REQ-2, REQ-3, and REQ-26 while preparing the input for RetrievalService.

**2. Hybrid Information Retrieval**

SuperAsk.AI uses a hybrid retrieval approach to find relevant government information from its approved knowledge base. As described in Sections 2 and 3, RetrievalService coordinates two search methods through the SearchIndex interface:

  - **KeywordIndex (BM25):** Evaluates the relevance of government passages based on matching search terms, term frequency, inverse document frequency, and document length.
  - **VectorIndex:** Represents questions and stored passages as numerical vectors and calculates their similarity using cosine similarity. The design supports meaning-based retrieval through embeddings.

The system combines results from both search methods using Reciprocal Rank Fusion (RRF). The design also includes a reranking stage, described in Section 3 as cross-encoder-style reranking, to prioritize relevant passages. The current implementation uses lexical matching signals for reranking, while the architecture allows more advanced reranking methods to be incorporated.

For example, when a user asks, "What documents are required to renew my passport?", the retrieval system searches for government passages related to passport renewal and required documents. The resulting candidates are merged, reranked, and filtered to exclude superseded or not-yet-effective content.

The retrieval process returns the highest-ranked passages with their source information for answer generation.

This algorithm supports REQ-4, REQ-5, and REQ-8.

**3. Three-Tier Answer Selection**

The QAController uses a three-tier decision process to determine how a question should be answered. This process follows the pipeline defined in Section 3.

  - **Tier 1 – Curated Answer:** If the question matches an approved curated answer above the configured threshold, the system returns that answer directly.
  - **Tier 2 – Retrieval-Augmented Generation:** If no suitable curated answer is found, RetrievalService retrieves relevant passages, and AIModelGateway uses them to generate a grounded answer.
  - **Tier 3 – Refusal: If the question** is unsupported, outside the system's scope, or lacks sufficiently relevant sources, the system declines to provide an unsupported answer and tells the user which areas it covers.

QAController applies policy guardrails and a confidence gate before proceeding with answer generation. The current design uses a curated-answer threshold of 0.72 and a minimum retrieval relevance threshold of 0.20, as specified in Section 2.

This process reduces the risk of generating answers without sufficient supporting information and supports REQ-7 and REQ-22.

**4. Answer Verification**

After AIModelGateway generates a response, AnswerVerifier checks whether important factual details are supported by the retrieved passages.

The verification process examines information such as fees, dates, deadlines, document requirements, and numerical values. It also checks that referenced citation identifiers correspond to retrieved sources.

If an answer contains an unsupported factual claim, the system can withhold the generated response instead of presenting it as verified.

For example, if an answer provides a passport-processing fee that does not appear in its cited passage, AnswerVerifier identifies the unsupported information.

CitationPresenter then presents the supporting sources separately from the answer text.

This process supports REQ-6, REQ-22, and REQ-28.

**5. Official Content Change Detection**

For UC-11: RefreshOfficialContent, RefreshController coordinates the monitoring of registered official government sources.

SourceRegistry maintains the list of registered sources, while the SourceCrawler interface defines how content is retrieved from different platforms.

The current design includes WebsiteCrawler, FacebookCrawler, and TelegramCrawler. WebsiteCrawler is implemented, while the Facebook and Telegram crawler adapters remain planned.

The content-refresh process performs the following operations:

1.  Load registered official sources from SourceRegistry.
2.  Retrieve permitted source content using the appropriate crawler.
3.  Extract relevant information and compare it with previously stored content.
4.  Identify new, modified, removed, or unreachable content.
5.  Classify detected changes and create ChangeSignal records.
6.  Place detected changes into ReviewQueue for human review.
7.  Update the approved knowledge base only after steward approval.

The design separates automated content collection from approval. The crawler does not directly insert unverified information into ContentStore.

This process supports REQ-29 and REQ-30 by allowing government information and registered sources to be updated without changing the core question-answering logic.

Overall, these algorithms support reliable information retrieval, grounded answer generation, and controlled updates to official government-service content.

**b. Data Structures**

SuperAsk.AI uses arrays, maps, structured objects, and indexed records to organize government-service information, maintain conversation history, and process retrieval results. These data structures correspond to the design classes and attributes described in Section 2.

**1. Arrays and Lists**

Arrays and lists store collections of government passages, search candidates, source citations, conversation messages, and registered sources.

For example, ContentStore maintains a list of approved Passage objects, while RetrievalService returns a ranked list of Candidate objects.

Arrays are appropriate because the system frequently processes collections of results in a specific order, particularly when ranking retrieved passages or displaying citations.

**2. Maps and Hash-Based Structures**

Maps provide efficient lookup using unique identifiers or search terms.

As described in Section 2, KeywordIndex uses a postings structure that maps search terms to passage identifiers and term frequencies. ContentStore also uses a map to retrieve passages by their identifiers.

These structures reduce the need to search through every stored record when locating a particular passage or calculating keyword relevance.

Maps were selected for efficient access and flexibility as the knowledge base expands.

**3. Structured Objects and Records**

Government information is organized into structured Passage objects containing fields such as ministry, document title, legal instrument, article, source URL, effective date, last-verified date, review date, and content.

A SourceCitation object contains the information needed to display an official source beneath an answer.

Using structured objects allows the system to maintain the relationship between government information and its supporting source metadata.

This organization supports REQ-4, REQ-6, and REQ-28.

**4. Retrieval Candidates and Numerical Vectors**

The retrieval system uses Candidate objects to store lexical scores, vector similarity scores, fused scores, and reranking results.

VectorIndex uses numerical vectors represented as lists of real numbers, with passage identifiers mapped to their corresponding vectors.

These structures allow RetrievalService to compare the results of different search methods and select the most relevant government passages.

**5. Conversation History**

ConversationHistory manages Conversation objects containing ordered lists of user and assistant messages.

The web application maintains conversation history in browser storage, while Telegram maintains short per-chat conversation history on the server.

Ordered message lists preserve conversation sequence, and keyed structures allow previous conversations to be identified and retrieved.

This supports UC-6: ViewRecentConversations and UC-8: AskFollowUpQuestion.

Overall, these data structures were selected based on retrieval efficiency, flexibility, maintainability, and compatibility with the TypeScript and Next.js architecture.

**c. Concurrency**

SuperAsk.AI handles multiple user requests through its web application and Telegram interfaces. The system uses asynchronous request processing rather than assigning manually managed threads to individual design objects.

The web application and Telegram bot can receive requests independently. Each request passes through the API Gateway and Controller subsystem, where QAController coordinates language processing, information retrieval, answer generation, and verification.

External AI service requests are handled asynchronously, allowing the server environment to manage other incoming requests while waiting for responses.

The system also includes a separate content-refresh process controlled by RefreshController. As described in Section 3, this process runs through a scheduled task on a separate machine rather than within the citizen-facing web server.

Because the question-answering and content-refresh processes operate separately, synchronization is important when managing shared government information.

The design addresses this by allowing citizen-facing retrieval to access approved ContentStore records while newly detected changes remain in ReviewQueue until reviewed. The steward-approval workflow is intended to prevent unapproved content from becoming available to users.

Conversation histories are also separated by conversation or chat identifier to prevent messages from different users from being mixed.

No custom thread synchronization mechanism is currently specified for the individual design classes. Concurrency is primarily managed by the Node.js runtime, serverless hosting environment, and the separation of background content-refresh operations.

Further testing will evaluate whether simultaneous requests are processed correctly and whether conversation history and approved content remain consistent.

### **10. Project Management**

  

1.  **\*\*Project Coordination and Progress Report\*\*** 

**Implemented Use Cases**

**1. Citizen Q\&A – Web**

Users can access the SuperAsk.AI web application and submit questions about Cambodian government services in Khmer or English. The system retrieves information from its knowledge base and provides answers with relevant source citations.

**2. Citizen Q\&A – Telegram**

Users can submit government-service questions through the Telegram bot and receive responses directly in the Telegram conversation.

**3. Telegram Mini App**

Users can access the SuperAsk.AI web chat interface through Telegram's Mini App or interact with the system through regular Telegram messages.

**4. Bilingual Support**

The landing page and chat interface support English and Khmer. The system also processes questions based on the language used by the user.

**5. Grounded Answers and Declines**

SuperAsk.AI retrieves government-service information from its approved knowledge base and provides source citations. When sufficient verified information is unavailable, the system can decline to provide an unsupported answer.

**Currently Functional**

  - Landing page and web chat interface
  - Question-and-answer API and information retrieval pipeline
  - Telegram bot text responses
  - Telegram Mini App access
  - English and Khmer interface support
  - Source citation display
  - Basic feedback functions
  - Production deployment and health checks

**Currently Being Worked On**

  - Real user authentication
  - Retrieval accuracy and AI response improvements
  - Expansion and verification of the government-service knowledge base
  - Feedback-report handling improvements
  - Content management and access-control functions
  - Telegram conversation history and multi-turn interaction improvements
  - Office contact and location lookup (UC-7)
  - Content refresh and change detection with steward review (UC-11)
  - Final testing and preparation for Demo Two

**Other Project Coordination Activities**

As of November 18, 2026, the team has completed Reports One and Two and successfully presented Demo One on November 9, 2026. During Demo One, the professor provided feedback regarding presentation visibility. Some team members were advised to enable their cameras and enlarge the speaker's video on screen. The team will incorporate this feedback into Demo Two to improve the presentation experience.

Following Demo One, the team is preparing Report Three by integrating the documentation from Reports One and Two and completing the additional requirements. These include effort estimation using Use Case Points, updated interaction diagrams incorporating design patterns, three traceability matrices, and Object Constraint Language (OCL) contracts.

Responsibilities for the remaining documentation have been distributed among team members. The Project Lead continues coordinating deadlines, reviewing report consistency, and integrating the completed sections.

The remaining project activities focus on completing Report Three by November 23, 2026, reviewing system functionality, resolving outstanding technical issues, and preparing for the final demonstration on December 4, 2026.

1.  **\*\*History of Work\*\***

The development of SuperAsk.AI has progressed through three reporting phases and two scheduled demonstrations. Reports One and Two established the system requirements, use cases, software design, architecture, and initial implementation. Report Three integrates and revises the earlier documentation to reflect the functionality planned for the final demonstration.

The project has generally followed the milestones established in Reports One and Two. However, as development progressed, the team refined the scope of certain features to distinguish between implemented functionality and features requiring additional development. The main question-and-answer system, official-source retrieval, citations, bilingual interface, and Telegram integration were prioritized for the first demonstration. Other features, including office contact and location lookup (UC-7) and content refresh and change detection (UC-11), require further development.

|  |  |  |
| :-: | :-: | :-: |
| \*\*Period\*\* | \*\*Actual Progress and Planned Work\*\* | \*\*Milestone\*\* |
| Sep 21–30 (Completed) | Completed requirements, business goals, use cases, preliminary interface designs, and project management documentation. Reviewed and integrated Report One. | Full Report One – Sep 30 |
| Oct 1–6 (Completed) | Prepared interaction diagrams for selected use cases. Continued development of web chat, retrieval, citations, bilingual functions, Telegram integration, and the deployed prototype. | Report Two Part One – Oct 6 |
| Oct 7–12 (Completed) | Prepared class diagrams, interface specifications, traceability matrices, and system architecture documentation. | Report Two Part Two – Oct 12 |
| Oct 13–21 (Completed) | Integrated and submitted Report Two, including algorithms and data structures, user interface design and implementation, design of tests, and project management documentation. | Full Report Two – Oct 21 |
| Oct 22–Nov 8 (Completed) | Continued prototype development, reviewed implemented functionality, prepared demonstration materials, and coordinated team contributions. | Demo One Preparation |
| Nov 9 (Completed) | Presented the first working iteration of SuperAsk.AI, received full marks, and recorded the professor's feedback regarding camera use and speaker visibility. | Demo One – Nov 9 |
| Nov 10–16 (Completed) | Continued documentation and reviewed additional Report Three requirements, including Use Case Points, design patterns, traceability matrices, and OCL contracts. | Report Three Part One – Nov 16 |
| Nov 17–23 (Current) | Integrate Reports One and Two, complete Report Three's additional technical sections, update project history, and review document consistency. | Full Report Three – Nov 23 |
| Nov 24–Dec 3 (Planned) | Complete remaining system testing, resolve outstanding defects, refine system functionality, and prepare the final demonstration with improved speaker visibility. | Final Refinements |
| Dec 4 (Planned) | Present the completed SuperAsk.AI system and demonstrate its final functionality. | Demo Two – Dec 4 |

**Comparison of Planned and Actual Milestones**

The initial project plan established milestones for requirements analysis, software design, implementation, and demonstration. The completed work can be compared with these milestones as follows:

  - **Report One:** The team completed the initial requirements analysis, business goals, use cases, and project management documentation during the planned reporting period.
  - **Report Two:** The team completed the software design documentation, including interaction diagrams, class diagrams, system architecture, algorithms, user interface design, and testing plans. These materials were integrated into the full report.
  - **Demo One:** The team successfully presented the working prototype on November 9, 2026, and received full marks. The professor recommended improvements to speaker visibility for the next demonstration.
  - **Report Three:** The team is revising the earlier reports and incorporating additional requirements, including Use Case Points estimation, design patterns, traceability matrices, and OCL contracts. The full submission is scheduled for November 23, 2026.
  - **Demo Two:** The final demonstration remains scheduled for December 4, 2026. Remaining activities include system testing, refinement of incomplete features, and final presentation preparation.

Overall, the major reporting and demonstration milestones have been completed or remain scheduled within the project's established timeline. The principal changes concern the implementation scope and the additional technical documentation required for Report Three. Features that are not fully implemented are identified separately rather than presented as completed functionality.

*Figure 19: Gantt Chart of SuperAsk.AI*

The Gantt chart illustrates the project's progress from September through December 2026. It identifies the completed reporting milestones and Demo One, the current Report Three submission period, and the remaining development and testing activities leading to Demo Two. The chart provides a visual comparison between the planned schedule and the project's documented progress.

1.   **\*\*Current Status and Future Work\*\***

**Current Status**

As of November 18, 2026, SuperAsk.AI has completed Reports One and Two and successfully presented Demo One. The team received full marks for these three assessments. The project is currently in the Report Three integration and refinement phase, with the final demonstration scheduled for December 4, 2026.

The project's key accomplishments include:

  - Developed and deployed the SuperAsk.AI landing page and web chat interface.
  - Implemented the question-and-answer API and government-information retrieval pipeline.
  - Integrated source citations to support grounded answers based on available official information.
  - Implemented responses that decline unsupported questions when sufficient verified information is unavailable.
  - Developed English and Khmer interface support.
  - Integrated Telegram bot text responses and Telegram Mini App access.
  - Implemented recent conversation functionality and basic feedback features.
  - Established production deployment and health-check functionality.
  - Completed the initial system requirements, software design, architecture, algorithms, interface design, and testing documentation.
  - Successfully presented Demo One and received feedback for improvements to the final demonstration.

Although the core functionality is operational, several features remain under development or require further testing. These include user authentication, retrieval accuracy improvements, expansion of the verified government-service knowledge base, feedback handling, content management, Telegram conversation history, and additional system functionality.

**Future Work**

The remaining development period will focus on improving system reliability, completing outstanding features, and preparing for Demo Two.

**Before the final demonstration, the team plans to:**

  - Complete and review Report Three, including the additional technical documentation required by the professor.
  - Conduct final unit, integration, and system testing to verify the implemented requirements.
  - Improve retrieval accuracy and evaluate the reliability of AI-generated responses.
  - Expand and verify government-service information in the knowledge base.
  - Continue development of office contact and location lookup (UC-7).
  - Improve content refresh and change detection with steward review (UC-11).
  - Refine Telegram conversation history and multi-turn interaction.
  - Improve feedback handling, content management, and access-control functions.
  - Resolve outstanding technical issues and ensure consistency between the implemented system and report documentation.
  - Prepare Demo Two with improved speaker visibility based on the professor's feedback from Demo One.

**Possible Future Improvements**

Beyond the final demonstration, SuperAsk.AI could be expanded to provide more comprehensive government-service assistance. Potential improvements include:

  - Completing integration with additional communication channels, including Messenger.
  - Expanding the number of supported Cambodian ministries and government institutions.
  - Improving automated monitoring of official government information while maintaining human verification before publication.
  - Developing more comprehensive office-directory information, including verified contact details and locations.
  - Strengthening authentication, access control, and administrative content-management capabilities.
  - Conducting broader usability testing with Cambodian users to evaluate bilingual accessibility, response clarity, and overall user experience.

These improvements would build upon the current prototype and support the project's long-term objective of making verified Cambodian government-service information more accessible, accurate, and convenient for citizens.

1.  **\*\*Team Responsibilities\*\***

The following table summarizes each team member's completed work, current responsibilities as of November 18, 2026, and planned contributions for the remaining development period. 

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| \*\*Team Member\*\* | \*\*Role\*\* | \*\*Work Completed\*\*  | \*\*Current Responsibilities\*\* | \*\*Future Responsibilities\*\* |
| \*\*Yean Fong\*\* | Project Lead | Coordinated Reports One and Two, project scheduling, documentation, and team organization. Prepared algorithms and data structures, user interface design and implementation, design of tests, and project management documentation. Assisted with Demo One preparation and report integration. | Coordinate Report Three, update project management and the Gantt chart, track milestones, integrate submitted sections, and review document consistency. | Oversee final documentation, coordinate Demo Two preparation, monitor remaining tasks, and ensure timely project completion. |
| \*\*Phallamonunhh Chun\*\* | AI/ML Engineer and System Design | Developed the RAG pipeline, retrieval functions, AI model integration, and guardrails. Prepared interaction diagrams, class diagrams, interface specifications, traceability matrices, and system architecture documentation. Supported Demo One preparation. | Continue improving retrieval accuracy, evaluating AI responses, and maintaining consistency between technical documentation and implementation. | Refine the retrieval and verification pipeline, support final integration testing, and improve AI response reliability. |
| \*\*Bunkheang Heng\*\* | Web/API Developer | Developed the web application, APIs, backend integration, and database-related functions. Contributed to system architecture documentation and Telegram integration. | Prepare effort estimation using Use Case Points, including complexity factors and development effort calculations. Continue supporting backend improvements. | Complete remaining backend integration, resolve technical issues, and assist with testing before Demo Two. |
| \*\*Doungkhe Neang\*\* | Data/Content Curator | Conducted government-service research, organized content, verified sources, and supported project documentation and coordination. | Prepare OCL contracts, including invariants, preconditions, and postconditions. Review class diagrams, interface specifications, and testing documentation. | Support knowledge-base expansion, verify government-service information, and assist with final documentation and testing. |
| \*\*Sereyprophea Sarin\*\* | QA/Testing Lead | Contributed to requirements review, documentation, QA planning, initial testing activities, and project scheduling. | Prepare three traceability matrices, including use cases to system requirements, use cases to domain concepts, and classes to domain concepts. Review requirements coverage. | Coordinate final test execution, document results, verify fixes, and support Demo Two preparation. |
| \*\*Heejae Choi\*\* | UX/UI Designer | Developed the prototype interface, user flows, responsive layouts, and initial UI specifications. Contributed to user effort estimation and system architecture documentation. | Revise interaction diagrams to incorporate design patterns and review system architecture and sequence diagrams. | Refine interface usability, improve responsive and bilingual interface behavior, and support Demo Two preparation. |

The team will continue reviewing project progress and coordinating responsibilities as development advances. Any changes to the system design, requirements, or implemented functionality will be reflected in the corresponding documentation to maintain consistency between the integrated Report Three and the final SuperAsk.AI implementation.

### 

### **11. References**

**SuperAsk.AI Team AO3. (2026).** ***SuperAsk.AI GitHub repository*****.****  
**<https://github.com/Monunhh/Super-ask.git>Used for project source code, version control, system implementation, and team development.

**Ministry of Education, Youth and Sport. (2026).** ***Ministry of Education, Youth and Sport – Cambodia*****.****  
**<https://moeys.gov.kh/en>Used as an official government source for information related to education services, procedures, requirements, and ministry information used by SuperAsk.AI.

**National Election Committee. (2026).** ***National Election Committee of Cambodia*****.****  
**<https://www.nec.gov.kh/english/>Used as an official source for voter registration, voter lists, election procedures, polling stations, and other electoral information.

**Marsic, I. (2012).** ***Software Engineering*****. Rutgers University.****  
**<https://eceweb1.rutgers.edu/~marsic/books/SE/book-SE_marsic.pdf>Used as a reference for software engineering concepts, requirements analysis, use-case modeling, interaction diagrams, design patterns, system architecture, class diagrams, and assigning responsibilities among system objects.

**Marsic, I. (n.d.).** ***Software Engineering: Final Project Report*****. Rutgers University.****  
**<https://eceweb1.rutgers.edu/~marsic/Teaching/SE/report3.html>Used as a reference for Report Three requirements, including Use Case Points estimation, traceability matrices, Object Constraint Language (OCL) contracts, design patterns, and project history documentation.

**Open Government Products. (n.d.).** ***AskGov Singapore*****.****  
**<https://ask.gov.sg/>Used as a reference for government-service information platforms, citizen-facing question-and-answer functionality, and accessible public-service information.
