# Internship Exam Question Bank

**Audience:** Internship / fresher candidates
**Domains:** 11
**Target size:** 100 questions per domain (1,100 total)
**Difficulty per domain:** 30 Basic, 65 Medium, 5 High
**Format:** ID | Subtopic | Difficulty | Question | Options A–D | Answer | Explanation

> Review draft. The sample's level and format are preserved. Questions are intended for review before importing into the exam application.

## Difficulty distribution

- Basic: 30 questions per domain
- Medium: 65 questions per domain
- High: 5 questions per domain


# FE — Frontend

**FE-001** | HTML | Basic
Which element is intended for the main heading of a page?
- A) <h1>
- B) <h6>
- C) <head>
- D) <title>
**Answer:** A
**Explanation:** It represents the top-level visible heading.

**FE-002** | HTML | Basic
Which attribute associates a label with a form control?
- A) href
- B) for
- C) src
- D) target
**Answer:** B
**Explanation:** The label's for value matches the control's id.

**FE-003** | HTML | Basic
Which input type provides built-in email-format validation?
- A) password
- B) button
- C) email
- D) text
**Answer:** C
**Explanation:** The email type provides basic browser-side format validation.

**FE-004** | CSS | Basic
Which property changes the text color?
- A) background-image
- B) display
- C) font-style
- D) color
**Answer:** D
**Explanation:** The color property controls foreground text color.

**FE-005** | CSS | Basic
Which layout system is designed primarily for one-dimensional rows or columns?
- A) Flexbox
- B) Float only
- C) Position absolute
- D) Grid
**Answer:** A
**Explanation:** Flexbox is especially useful for arranging items along one axis.

**FE-006** | CSS | Basic
Which selector targets an element with id="menu"?
- A) menu*
- B) #menu
- C) .menu
- D) @menu
**Answer:** B
**Explanation:** An ID selector begins with #.

**FE-007** | CSS | Basic
What does box-sizing: border-box do?
- A) Makes every element inline
- B) Adds margin inside content
- C) Includes padding and border in the declared width
- D) Removes all padding
**Answer:** C
**Explanation:** The declared size includes content, padding, and border.

**FE-008** | JavaScript | Basic
What does === compare?
- A) Whether values are strings
- B) Only object properties
- C) Only variable names
- D) Value and type without coercion
**Answer:** D
**Explanation:** Strict equality avoids type coercion.

**FE-009** | JavaScript | Basic
Which array method creates a new array by transforming each item?
- A) map
- B) pop
- C) push
- D) includes
**Answer:** A
**Explanation:** map returns a new array containing callback results.

**FE-010** | JavaScript | Basic
What does typeof null return in JavaScript?
- A) undefined
- B) object
- C) null
- D) number
**Answer:** B
**Explanation:** This is a longstanding JavaScript language quirk.

**FE-011** | DOM | Basic
Which method selects the first element matching a CSS selector?
- A) selectFirst
- B) findNode
- C) querySelector
- D) getAll
**Answer:** C
**Explanation:** querySelector returns the first matching element or null.

**FE-012** | DOM | Basic
Which event commonly fires when a user submits a form?
- A) resizeText
- B) paint
- C) hover
- D) submit
**Answer:** D
**Explanation:** The submit event is fired when a form is submitted.

**FE-013** | React | Basic
What is a React prop?
- A) Input passed from a parent component
- B) A database table
- C) A browser cookie
- D) A CSS selector
**Answer:** A
**Explanation:** Props let a parent pass data to a child component.

**FE-014** | React | Basic
Which hook is commonly used for local component state?
- A) useStyle
- B) useState
- C) useRoute
- D) useFetchNow
**Answer:** B
**Explanation:** useState stores state and provides a setter.

**FE-015** | React | Basic
Why should list items often have stable keys?
- A) To encrypt list data
- B) To add CSS automatically
- C) To help React identify items between renders
- D) To prevent all re-renders
**Answer:** C
**Explanation:** Stable keys help React track list identity when items change.

**FE-016** | Responsive Design | Basic
Which CSS feature applies styles based on viewport conditions?
- A) Webhooks
- B) SQL queries
- C) Event bubbling
- D) Media queries
**Answer:** D
**Explanation:** Media queries adapt layout to viewport or device conditions.

**FE-017** | Responsive Design | Basic
What is the purpose of the viewport meta tag on mobile pages?
- A) Help the layout use the device viewport correctly
- B) Load React
- C) Compress images
- D) Enable database access
**Answer:** A
**Explanation:** It helps mobile browsers size the layout viewport appropriately.

**FE-018** | Accessibility | Basic
Which attribute provides alternative text for a meaningful image?
- A) caption-id
- B) alt
- C) role-name
- D) title-only
**Answer:** B
**Explanation:** Alt text communicates image meaning to users who cannot see it.

**FE-019** | Accessibility | Basic
Why should form inputs have associated labels?
- A) To hide input values
- B) To replace validation
- C) To identify controls clearly, including for assistive technology
- D) To make requests faster
**Answer:** C
**Explanation:** Labels improve usability and accessible name computation.

**FE-020** | Performance | Basic
What is a common benefit of lazy-loading below-the-fold images?
- A) JavaScript is removed
- B) All images become higher resolution
- C) The server no longer responds
- D) Images load when needed, reducing initial work
**Answer:** D
**Explanation:** Deferring off-screen images can reduce initial network work.

**FE-021** | Performance | Basic
What does minification generally do?
- A) Removes unnecessary characters from code files
- B) Encrypts source code
- C) Adds comments
- D) Duplicates assets
**Answer:** A
**Explanation:** Minification reduces file size while preserving behavior.

**FE-022** | HTTP | Basic
Which request method is normally used to retrieve a resource?
- A) PATCH
- B) GET
- C) CONNECT
- D) DELETE
**Answer:** B
**Explanation:** GET is intended for retrieving a representation.

**FE-023** | HTTP | Basic
What does a 404 response indicate?
- A) The server created a resource
- B) The server permanently moved the resource
- C) The requested resource was not found
- D) The request succeeded with no body
**Answer:** C
**Explanation:** 404 means the server cannot find the requested resource.

**FE-024** | Debugging | Basic
Where can a developer usually inspect browser JavaScript errors?
- A) Image metadata panel
- B) Spreadsheet formula bar
- C) DNS record editor
- D) Developer Tools Console
**Answer:** D
**Explanation:** The browser console displays runtime errors and logs.

**FE-025** | JavaScript | Basic
Which keyword declares a block-scoped variable that can be reassigned?
- A) let
- B) define
- C) const
- D) static
**Answer:** A
**Explanation:** let declares a block-scoped binding that can be reassigned.

**FE-026** | React | Basic
What should generally happen when a user clicks a button to update React state?
- A) Change a prop in place
- B) Call the relevant state setter
- C) Reload the server database automatically
- D) Directly edit React's internal DOM tree
**Answer:** B
**Explanation:** State setters request a render using the updated state.

**FE-027** | CSS | Basic
Which property controls the space inside an element's border?
- A) outline
- B) margin
- C) padding
- D) gap-only
**Answer:** C
**Explanation:** Padding is the space between content and border.

**FE-028** | CSS | Basic
Which unit is relative to the root element's font size?
- A) vh
- B) deg
- C) px
- D) rem
**Answer:** D
**Explanation:** rem is based on the root element's computed font size.

**FE-029** | DOM | Basic
What is event bubbling?
- A) An event propagates from a target toward ancestor elements
- B) CSS selectors become global
- C) A page grows vertically
- D) A promise resolves twice
**Answer:** A
**Explanation:** Bubbling lets ancestors handle events originating in descendants.

**FE-030** | Performance | Basic
What is a likely benefit of code splitting?
- A) Repeat API calls
- B) Load only the code needed for a particular route or feature
- C) Combine every script into one huge file
- D) Disable caching
**Answer:** B
**Explanation:** Code splitting can reduce the initial JavaScript payload.

**FE-031** | HTML | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which element is intended for the main heading of a page?
- A) <head>
- B) <title>
- C) <h1>
- D) <h6>
**Answer:** C
**Explanation:** It represents the top-level visible heading.

**FE-032** | HTML | Medium
In a practical project, which statement is the most accurate?

Context: Which attribute associates a label with a form control?
- A) target
- B) src
- C) href
- D) for
**Answer:** D
**Explanation:** The label's for value matches the control's id.

**FE-033** | HTML | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which input type provides built-in email-format validation?
- A) email
- B) button
- C) password
- D) text
**Answer:** A
**Explanation:** The email type provides basic browser-side format validation.

**FE-034** | CSS | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which property changes the text color?
- A) display
- B) color
- C) font-style
- D) background-image
**Answer:** B
**Explanation:** The color property controls foreground text color.

**FE-035** | CSS | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which layout system is designed primarily for one-dimensional rows or columns?
- A) Float only
- B) Grid
- C) Flexbox
- D) Position absolute
**Answer:** C
**Explanation:** Flexbox is especially useful for arranging items along one axis.

**FE-036** | CSS | Medium
In a practical project, which statement is the most accurate?

Context: Which selector targets an element with id="menu"?
- A) @menu
- B) .menu
- C) menu*
- D) #menu
**Answer:** D
**Explanation:** An ID selector begins with #.

**FE-037** | CSS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does box-sizing: border-box do?
- A) Includes padding and border in the declared width
- B) Removes all padding
- C) Makes every element inline
- D) Adds margin inside content
**Answer:** A
**Explanation:** The declared size includes content, padding, and border.

**FE-038** | JavaScript | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does === compare?
- A) Whether values are strings
- B) Value and type without coercion
- C) Only object properties
- D) Only variable names
**Answer:** B
**Explanation:** Strict equality avoids type coercion.

**FE-039** | JavaScript | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which array method creates a new array by transforming each item?
- A) pop
- B) includes
- C) map
- D) push
**Answer:** C
**Explanation:** map returns a new array containing callback results.

**FE-040** | JavaScript | Medium
In a practical project, which statement is the most accurate?

Context: What does typeof null return in JavaScript?
- A) undefined
- B) number
- C) null
- D) object
**Answer:** D
**Explanation:** This is a longstanding JavaScript language quirk.

**FE-041** | DOM | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which method selects the first element matching a CSS selector?
- A) querySelector
- B) getAll
- C) findNode
- D) selectFirst
**Answer:** A
**Explanation:** querySelector returns the first matching element or null.

**FE-042** | DOM | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which event commonly fires when a user submits a form?
- A) paint
- B) submit
- C) hover
- D) resizeText
**Answer:** B
**Explanation:** The submit event is fired when a form is submitted.

**FE-043** | React | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a React prop?
- A) A CSS selector
- B) A browser cookie
- C) Input passed from a parent component
- D) A database table
**Answer:** C
**Explanation:** Props let a parent pass data to a child component.

**FE-044** | React | Medium
In a practical project, which statement is the most accurate?

Context: Which hook is commonly used for local component state?
- A) useFetchNow
- B) useStyle
- C) useRoute
- D) useState
**Answer:** D
**Explanation:** useState stores state and provides a setter.

**FE-045** | React | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should list items often have stable keys?
- A) To help React identify items between renders
- B) To prevent all re-renders
- C) To add CSS automatically
- D) To encrypt list data
**Answer:** A
**Explanation:** Stable keys help React track list identity when items change.

**FE-046** | Responsive Design | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which CSS feature applies styles based on viewport conditions?
- A) Event bubbling
- B) Media queries
- C) SQL queries
- D) Webhooks
**Answer:** B
**Explanation:** Media queries adapt layout to viewport or device conditions.

**FE-047** | Responsive Design | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the purpose of the viewport meta tag on mobile pages?
- A) Load React
- B) Compress images
- C) Help the layout use the device viewport correctly
- D) Enable database access
**Answer:** C
**Explanation:** It helps mobile browsers size the layout viewport appropriately.

**FE-048** | Accessibility | Medium
In a practical project, which statement is the most accurate?

Context: Which attribute provides alternative text for a meaningful image?
- A) title-only
- B) caption-id
- C) role-name
- D) alt
**Answer:** D
**Explanation:** Alt text communicates image meaning to users who cannot see it.

**FE-049** | Accessibility | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should form inputs have associated labels?
- A) To identify controls clearly, including for assistive technology
- B) To replace validation
- C) To make requests faster
- D) To hide input values
**Answer:** A
**Explanation:** Labels improve usability and accessible name computation.

**FE-050** | Performance | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a common benefit of lazy-loading below-the-fold images?
- A) All images become higher resolution
- B) Images load when needed, reducing initial work
- C) The server no longer responds
- D) JavaScript is removed
**Answer:** B
**Explanation:** Deferring off-screen images can reduce initial network work.

**FE-051** | Performance | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does minification generally do?
- A) Adds comments
- B) Encrypts source code
- C) Removes unnecessary characters from code files
- D) Duplicates assets
**Answer:** C
**Explanation:** Minification reduces file size while preserving behavior.

**FE-052** | HTTP | Medium
In a practical project, which statement is the most accurate?

Context: Which request method is normally used to retrieve a resource?
- A) DELETE
- B) PATCH
- C) CONNECT
- D) GET
**Answer:** D
**Explanation:** GET is intended for retrieving a representation.

**FE-053** | HTTP | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does a 404 response indicate?
- A) The requested resource was not found
- B) The server created a resource
- C) The request succeeded with no body
- D) The server permanently moved the resource
**Answer:** A
**Explanation:** 404 means the server cannot find the requested resource.

**FE-054** | Debugging | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Where can a developer usually inspect browser JavaScript errors?
- A) DNS record editor
- B) Developer Tools Console
- C) Image metadata panel
- D) Spreadsheet formula bar
**Answer:** B
**Explanation:** The browser console displays runtime errors and logs.

**FE-055** | JavaScript | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which keyword declares a block-scoped variable that can be reassigned?
- A) const
- B) define
- C) let
- D) static
**Answer:** C
**Explanation:** let declares a block-scoped binding that can be reassigned.

**FE-056** | React | Medium
In a practical project, which statement is the most accurate?

Context: What should generally happen when a user clicks a button to update React state?
- A) Directly edit React's internal DOM tree
- B) Reload the server database automatically
- C) Change a prop in place
- D) Call the relevant state setter
**Answer:** D
**Explanation:** State setters request a render using the updated state.

**FE-057** | CSS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which property controls the space inside an element's border?
- A) padding
- B) margin
- C) outline
- D) gap-only
**Answer:** A
**Explanation:** Padding is the space between content and border.

**FE-058** | CSS | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which unit is relative to the root element's font size?
- A) vh
- B) rem
- C) deg
- D) px
**Answer:** B
**Explanation:** rem is based on the root element's computed font size.

**FE-059** | DOM | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is event bubbling?
- A) A promise resolves twice
- B) A page grows vertically
- C) An event propagates from a target toward ancestor elements
- D) CSS selectors become global
**Answer:** C
**Explanation:** Bubbling lets ancestors handle events originating in descendants.

**FE-060** | Performance | Medium
In a practical project, which statement is the most accurate?

Context: What is a likely benefit of code splitting?
- A) Combine every script into one huge file
- B) Repeat API calls
- C) Disable caching
- D) Load only the code needed for a particular route or feature
**Answer:** D
**Explanation:** Code splitting can reduce the initial JavaScript payload.

**FE-061** | HTML | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which element is intended for the main heading of a page?
- A) <h1>
- B) <title>
- C) <h6>
- D) <head>
**Answer:** A
**Explanation:** It represents the top-level visible heading.

**FE-062** | HTML | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which attribute associates a label with a form control?
- A) src
- B) for
- C) href
- D) target
**Answer:** B
**Explanation:** The label's for value matches the control's id.

**FE-063** | HTML | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which input type provides built-in email-format validation?
- A) button
- B) password
- C) email
- D) text
**Answer:** C
**Explanation:** The email type provides basic browser-side format validation.

**FE-064** | CSS | Medium
In a practical project, which statement is the most accurate?

Context: Which property changes the text color?
- A) font-style
- B) background-image
- C) display
- D) color
**Answer:** D
**Explanation:** The color property controls foreground text color.

**FE-065** | CSS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which layout system is designed primarily for one-dimensional rows or columns?
- A) Flexbox
- B) Float only
- C) Grid
- D) Position absolute
**Answer:** A
**Explanation:** Flexbox is especially useful for arranging items along one axis.

**FE-066** | CSS | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which selector targets an element with id="menu"?
- A) menu*
- B) #menu
- C) .menu
- D) @menu
**Answer:** B
**Explanation:** An ID selector begins with #.

**FE-067** | CSS | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does box-sizing: border-box do?
- A) Removes all padding
- B) Makes every element inline
- C) Includes padding and border in the declared width
- D) Adds margin inside content
**Answer:** C
**Explanation:** The declared size includes content, padding, and border.

**FE-068** | JavaScript | Medium
In a practical project, which statement is the most accurate?

Context: What does === compare?
- A) Whether values are strings
- B) Only variable names
- C) Only object properties
- D) Value and type without coercion
**Answer:** D
**Explanation:** Strict equality avoids type coercion.

**FE-069** | JavaScript | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which array method creates a new array by transforming each item?
- A) map
- B) includes
- C) pop
- D) push
**Answer:** A
**Explanation:** map returns a new array containing callback results.

**FE-070** | JavaScript | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does typeof null return in JavaScript?
- A) undefined
- B) object
- C) number
- D) null
**Answer:** B
**Explanation:** This is a longstanding JavaScript language quirk.

**FE-071** | DOM | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which method selects the first element matching a CSS selector?
- A) getAll
- B) selectFirst
- C) querySelector
- D) findNode
**Answer:** C
**Explanation:** querySelector returns the first matching element or null.

**FE-072** | DOM | Medium
In a practical project, which statement is the most accurate?

Context: Which event commonly fires when a user submits a form?
- A) hover
- B) paint
- C) resizeText
- D) submit
**Answer:** D
**Explanation:** The submit event is fired when a form is submitted.

**FE-073** | React | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a React prop?
- A) Input passed from a parent component
- B) A database table
- C) A browser cookie
- D) A CSS selector
**Answer:** A
**Explanation:** Props let a parent pass data to a child component.

**FE-074** | React | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which hook is commonly used for local component state?
- A) useRoute
- B) useState
- C) useStyle
- D) useFetchNow
**Answer:** B
**Explanation:** useState stores state and provides a setter.

**FE-075** | React | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should list items often have stable keys?
- A) To prevent all re-renders
- B) To add CSS automatically
- C) To help React identify items between renders
- D) To encrypt list data
**Answer:** C
**Explanation:** Stable keys help React track list identity when items change.

**FE-076** | Responsive Design | Medium
In a practical project, which statement is the most accurate?

Context: Which CSS feature applies styles based on viewport conditions?
- A) Event bubbling
- B) Webhooks
- C) SQL queries
- D) Media queries
**Answer:** D
**Explanation:** Media queries adapt layout to viewport or device conditions.

**FE-077** | Responsive Design | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the purpose of the viewport meta tag on mobile pages?
- A) Help the layout use the device viewport correctly
- B) Compress images
- C) Load React
- D) Enable database access
**Answer:** A
**Explanation:** It helps mobile browsers size the layout viewport appropriately.

**FE-078** | Accessibility | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which attribute provides alternative text for a meaningful image?
- A) title-only
- B) alt
- C) role-name
- D) caption-id
**Answer:** B
**Explanation:** Alt text communicates image meaning to users who cannot see it.

**FE-079** | Accessibility | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should form inputs have associated labels?
- A) To make requests faster
- B) To replace validation
- C) To identify controls clearly, including for assistive technology
- D) To hide input values
**Answer:** C
**Explanation:** Labels improve usability and accessible name computation.

**FE-080** | Performance | Medium
In a practical project, which statement is the most accurate?

Context: What is a common benefit of lazy-loading below-the-fold images?
- A) JavaScript is removed
- B) The server no longer responds
- C) All images become higher resolution
- D) Images load when needed, reducing initial work
**Answer:** D
**Explanation:** Deferring off-screen images can reduce initial network work.

**FE-081** | Performance | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does minification generally do?
- A) Removes unnecessary characters from code files
- B) Adds comments
- C) Duplicates assets
- D) Encrypts source code
**Answer:** A
**Explanation:** Minification reduces file size while preserving behavior.

**FE-082** | HTTP | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which request method is normally used to retrieve a resource?
- A) CONNECT
- B) GET
- C) DELETE
- D) PATCH
**Answer:** B
**Explanation:** GET is intended for retrieving a representation.

**FE-083** | HTTP | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does a 404 response indicate?
- A) The server permanently moved the resource
- B) The server created a resource
- C) The requested resource was not found
- D) The request succeeded with no body
**Answer:** C
**Explanation:** 404 means the server cannot find the requested resource.

**FE-084** | Debugging | Medium
In a practical project, which statement is the most accurate?

Context: Where can a developer usually inspect browser JavaScript errors?
- A) Spreadsheet formula bar
- B) Image metadata panel
- C) DNS record editor
- D) Developer Tools Console
**Answer:** D
**Explanation:** The browser console displays runtime errors and logs.

**FE-085** | JavaScript | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which keyword declares a block-scoped variable that can be reassigned?
- A) let
- B) define
- C) const
- D) static
**Answer:** A
**Explanation:** let declares a block-scoped binding that can be reassigned.

**FE-086** | React | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What should generally happen when a user clicks a button to update React state?
- A) Change a prop in place
- B) Call the relevant state setter
- C) Reload the server database automatically
- D) Directly edit React's internal DOM tree
**Answer:** B
**Explanation:** State setters request a render using the updated state.

**FE-087** | CSS | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which property controls the space inside an element's border?
- A) margin
- B) gap-only
- C) padding
- D) outline
**Answer:** C
**Explanation:** Padding is the space between content and border.

**FE-088** | CSS | Medium
In a practical project, which statement is the most accurate?

Context: Which unit is relative to the root element's font size?
- A) deg
- B) vh
- C) px
- D) rem
**Answer:** D
**Explanation:** rem is based on the root element's computed font size.

**FE-089** | DOM | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is event bubbling?
- A) An event propagates from a target toward ancestor elements
- B) A page grows vertically
- C) CSS selectors become global
- D) A promise resolves twice
**Answer:** A
**Explanation:** Bubbling lets ancestors handle events originating in descendants.

**FE-090** | Performance | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a likely benefit of code splitting?
- A) Disable caching
- B) Load only the code needed for a particular route or feature
- C) Repeat API calls
- D) Combine every script into one huge file
**Answer:** B
**Explanation:** Code splitting can reduce the initial JavaScript payload.

**FE-091** | HTML | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which element is intended for the main heading of a page?
- A) <title>
- B) <head>
- C) <h1>
- D) <h6>
**Answer:** C
**Explanation:** It represents the top-level visible heading.

**FE-092** | HTML | Medium
In a practical project, which statement is the most accurate?

Context: Which attribute associates a label with a form control?
- A) src
- B) href
- C) target
- D) for
**Answer:** D
**Explanation:** The label's for value matches the control's id.

**FE-093** | HTML | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which input type provides built-in email-format validation?
- A) email
- B) button
- C) text
- D) password
**Answer:** A
**Explanation:** The email type provides basic browser-side format validation.

**FE-094** | CSS | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which property changes the text color?
- A) display
- B) color
- C) background-image
- D) font-style
**Answer:** B
**Explanation:** The color property controls foreground text color.

**FE-095** | CSS | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which layout system is designed primarily for one-dimensional rows or columns?
- A) Position absolute
- B) Float only
- C) Flexbox
- D) Grid
**Answer:** C
**Explanation:** Flexbox is especially useful for arranging items along one axis.

**FE-096** | CSS | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Which selector targets an element with id="menu"?
- A) .menu
- B) @menu
- C) menu*
- D) #menu
**Answer:** D
**Explanation:** An ID selector begins with #.

**FE-097** | CSS | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: What does box-sizing: border-box do?
- A) Includes padding and border in the declared width
- B) Removes all padding
- C) Adds margin inside content
- D) Makes every element inline
**Answer:** A
**Explanation:** The declared size includes content, padding, and border.

**FE-098** | JavaScript | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: What does === compare?
- A) Whether values are strings
- B) Value and type without coercion
- C) Only variable names
- D) Only object properties
**Answer:** B
**Explanation:** Strict equality avoids type coercion.

**FE-099** | JavaScript | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: Which array method creates a new array by transforming each item?
- A) pop
- B) push
- C) map
- D) includes
**Answer:** C
**Explanation:** map returns a new array containing callback results.

**FE-100** | JavaScript | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What does typeof null return in JavaScript?
- A) undefined
- B) null
- C) number
- D) object
**Answer:** D
**Explanation:** This is a longstanding JavaScript language quirk.


# BE — Backend

**BE-001** | HTTP | Basic
Which HTTP method is normally used to retrieve data?
- A) DELETE
- B) POST
- C) PATCH
- D) GET
**Answer:** D
**Explanation:** GET is intended for retrieving a resource.

**BE-002** | HTTP | Basic
Which status code commonly indicates successful resource creation?
- A) 201
- B) 301
- C) 503
- D) 401
**Answer:** A
**Explanation:** 201 Created indicates that a resource was created.

**BE-003** | HTTP | Basic
What does status code 401 generally mean?
- A) The request succeeded without content
- B) Authentication is required or has failed
- C) The server is permanently redirected
- D) The resource was created
**Answer:** B
**Explanation:** 401 relates to authentication credentials.

**BE-004** | REST APIs | Basic
What does statelessness mean for a REST request?
- A) Responses cannot be JSON
- B) The server cannot use a database
- C) Each request contains the information needed to process it
- D) Clients never send headers
**Answer:** C
**Explanation:** The server does not rely on stored client session state between requests.

**BE-005** | REST APIs | Basic
Which response is most appropriate when a request body is invalid?
- A) 301 Moved Permanently
- B) 101 Switching Protocols
- C) 201 Created
- D) 400 Bad Request
**Answer:** D
**Explanation:** 400 indicates that the request is malformed or invalid.

**BE-006** | Authentication | Basic
What is authorization concerned with?
- A) What an authenticated user is allowed to do
- B) Creating database backups
- C) Compressing response bodies
- D) Proving a user's identity only
**Answer:** A
**Explanation:** Authorization determines permitted actions and resources.

**BE-007** | Authentication | Basic
Why should passwords generally be stored using a password-hashing function?
- A) To reduce every password to the same value
- B) To avoid storing recoverable plaintext passwords
- C) To send passwords in URLs
- D) To make passwords visible to support staff
**Answer:** B
**Explanation:** A suitable password hash makes recovering the original password difficult.

**BE-008** | Databases | Basic
What is a primary key used for?
- A) Encrypting a table
- B) Sorting every query automatically
- C) Uniquely identifying a row
- D) Replacing all indexes
**Answer:** C
**Explanation:** A primary key uniquely identifies each record.

**BE-009** | SQL | Basic
Which SQL clause filters rows before grouping?
- A) AS
- B) LIMIT
- C) ORDER BY
- D) WHERE
**Answer:** D
**Explanation:** WHERE filters rows before GROUP BY aggregation.

**BE-010** | SQL | Basic
Which SQL command retrieves data from a table?
- A) SELECT
- B) INSERT
- C) UPDATE
- D) DROP
**Answer:** A
**Explanation:** SELECT queries rows from database tables or views.

**BE-011** | Validation | Basic
Why validate input on the server even if the browser validates it?
- A) Browsers never send strings
- B) Clients can bypass browser-side checks
- C) Server validation slows attackers only
- D) HTML validation encrypts data
**Answer:** B
**Explanation:** Client-side checks improve usability but are not a security boundary.

**BE-012** | Caching | Basic
What is a typical purpose of caching?
- A) Permanently delete source data
- B) Replace authentication
- C) Reuse a previous result to reduce latency or repeated work
- D) Guarantee data is always fresh
**Answer:** C
**Explanation:** Caching can speed up reads but needs an appropriate freshness strategy.

**BE-013** | Errors | Basic
Why should an API avoid returning raw stack traces to public clients?
- A) They prevent HTTP from working
- B) They make JSON invalid by definition
- C) They improve accessibility too much
- D) They may reveal implementation details or secrets
**Answer:** D
**Explanation:** Detailed traces can expose sensitive internal information.

**BE-014** | Security | Basic
What is the principle of least privilege?
- A) Grant only the permissions needed for the task
- B) Give all users administrator rights
- C) Disable logs
- D) Share one password across services
**Answer:** A
**Explanation:** Least privilege limits the impact of mistakes and compromised accounts.

**BE-015** | Scalability | Basic
What is a benefit of moving long-running work to a background queue?
- A) Authentication becomes unnecessary
- B) The request can respond quickly while work runs asynchronously
- C) Every job is guaranteed to succeed
- D) The database is no longer needed
**Answer:** B
**Explanation:** Queues decouple slow work from the user-facing request.

**BE-016** | REST APIs | Basic
Which method is commonly used to partially update a resource?
- A) CONNECT
- B) OPTIONS only
- C) PATCH
- D) TRACE
**Answer:** C
**Explanation:** PATCH applies partial modifications to a resource.

**BE-017** | Databases | Basic
What does an index commonly improve?
- A) Every write operation in all cases
- B) Network bandwidth
- C) Data confidentiality by itself
- D) Lookup performance for selected queries
**Answer:** D
**Explanation:** Indexes can speed reads but may add storage and write overhead.

**BE-018** | SQL | Basic
Which clause sorts query results?
- A) ORDER BY
- B) HAVING only
- C) WHERE
- D) VALUES
**Answer:** A
**Explanation:** ORDER BY specifies the result ordering.

**BE-019** | Authentication | Basic
Why should an API token be kept out of public source control?
- A) It prevents unit testing
- B) Anyone who obtains it may be able to use its privileges
- C) Tokens only work in private repositories
- D) It makes the code compile slowly
**Answer:** B
**Explanation:** Exposed credentials can enable unauthorized access.

**BE-020** | Errors | Basic
What should a backend typically do if a dependency temporarily fails?
- A) Retry forever without limits
- B) Expose credentials in the error message
- C) Handle the failure safely and return an appropriate response
- D) Return success regardless of outcome
**Answer:** C
**Explanation:** Controlled errors and bounded retries prevent cascading failures.

**BE-021** | HTTP | Basic
Which HTTP method is normally used to retrieve data?
- A) POST
- B) PATCH
- C) DELETE
- D) GET
**Answer:** D
**Explanation:** GET is intended for retrieving a resource.

**BE-022** | HTTP | Basic
Which status code commonly indicates successful resource creation?
- A) 201
- B) 301
- C) 401
- D) 503
**Answer:** A
**Explanation:** 201 Created indicates that a resource was created.

**BE-023** | HTTP | Basic
What does status code 401 generally mean?
- A) The request succeeded without content
- B) Authentication is required or has failed
- C) The resource was created
- D) The server is permanently redirected
**Answer:** B
**Explanation:** 401 relates to authentication credentials.

**BE-024** | REST APIs | Basic
What does statelessness mean for a REST request?
- A) Responses cannot be JSON
- B) The server cannot use a database
- C) Each request contains the information needed to process it
- D) Clients never send headers
**Answer:** C
**Explanation:** The server does not rely on stored client session state between requests.

**BE-025** | REST APIs | Basic
Which response is most appropriate when a request body is invalid?
- A) 301 Moved Permanently
- B) 101 Switching Protocols
- C) 201 Created
- D) 400 Bad Request
**Answer:** D
**Explanation:** 400 indicates that the request is malformed or invalid.

**BE-026** | Authentication | Basic
What is authorization concerned with?
- A) What an authenticated user is allowed to do
- B) Compressing response bodies
- C) Proving a user's identity only
- D) Creating database backups
**Answer:** A
**Explanation:** Authorization determines permitted actions and resources.

**BE-027** | Authentication | Basic
Why should passwords generally be stored using a password-hashing function?
- A) To make passwords visible to support staff
- B) To avoid storing recoverable plaintext passwords
- C) To reduce every password to the same value
- D) To send passwords in URLs
**Answer:** B
**Explanation:** A suitable password hash makes recovering the original password difficult.

**BE-028** | Databases | Basic
What is a primary key used for?
- A) Encrypting a table
- B) Replacing all indexes
- C) Uniquely identifying a row
- D) Sorting every query automatically
**Answer:** C
**Explanation:** A primary key uniquely identifies each record.

**BE-029** | SQL | Basic
Which SQL clause filters rows before grouping?
- A) ORDER BY
- B) AS
- C) LIMIT
- D) WHERE
**Answer:** D
**Explanation:** WHERE filters rows before GROUP BY aggregation.

**BE-030** | SQL | Basic
Which SQL command retrieves data from a table?
- A) SELECT
- B) DROP
- C) UPDATE
- D) INSERT
**Answer:** A
**Explanation:** SELECT queries rows from database tables or views.

**BE-031** | Validation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why validate input on the server even if the browser validates it?
- A) HTML validation encrypts data
- B) Clients can bypass browser-side checks
- C) Browsers never send strings
- D) Server validation slows attackers only
**Answer:** B
**Explanation:** Client-side checks improve usability but are not a security boundary.

**BE-032** | Caching | Medium
In a practical project, which statement is the most accurate?

Context: What is a typical purpose of caching?
- A) Permanently delete source data
- B) Guarantee data is always fresh
- C) Reuse a previous result to reduce latency or repeated work
- D) Replace authentication
**Answer:** C
**Explanation:** Caching can speed up reads but needs an appropriate freshness strategy.

**BE-033** | Errors | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should an API avoid returning raw stack traces to public clients?
- A) They make JSON invalid by definition
- B) They prevent HTTP from working
- C) They improve accessibility too much
- D) They may reveal implementation details or secrets
**Answer:** D
**Explanation:** Detailed traces can expose sensitive internal information.

**BE-034** | Security | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the principle of least privilege?
- A) Grant only the permissions needed for the task
- B) Share one password across services
- C) Disable logs
- D) Give all users administrator rights
**Answer:** A
**Explanation:** Least privilege limits the impact of mistakes and compromised accounts.

**BE-035** | Scalability | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a benefit of moving long-running work to a background queue?
- A) Authentication becomes unnecessary
- B) The request can respond quickly while work runs asynchronously
- C) The database is no longer needed
- D) Every job is guaranteed to succeed
**Answer:** B
**Explanation:** Queues decouple slow work from the user-facing request.

**BE-036** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: Which method is commonly used to partially update a resource?
- A) TRACE
- B) CONNECT
- C) PATCH
- D) OPTIONS only
**Answer:** C
**Explanation:** PATCH applies partial modifications to a resource.

**BE-037** | Databases | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does an index commonly improve?
- A) Network bandwidth
- B) Data confidentiality by itself
- C) Every write operation in all cases
- D) Lookup performance for selected queries
**Answer:** D
**Explanation:** Indexes can speed reads but may add storage and write overhead.

**BE-038** | SQL | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which clause sorts query results?
- A) ORDER BY
- B) WHERE
- C) HAVING only
- D) VALUES
**Answer:** A
**Explanation:** ORDER BY specifies the result ordering.

**BE-039** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should an API token be kept out of public source control?
- A) Tokens only work in private repositories
- B) Anyone who obtains it may be able to use its privileges
- C) It prevents unit testing
- D) It makes the code compile slowly
**Answer:** B
**Explanation:** Exposed credentials can enable unauthorized access.

**BE-040** | Errors | Medium
In a practical project, which statement is the most accurate?

Context: What should a backend typically do if a dependency temporarily fails?
- A) Expose credentials in the error message
- B) Return success regardless of outcome
- C) Handle the failure safely and return an appropriate response
- D) Retry forever without limits
**Answer:** C
**Explanation:** Controlled errors and bounded retries prevent cascading failures.

**BE-041** | HTTP | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which HTTP method is normally used to retrieve data?
- A) PATCH
- B) POST
- C) DELETE
- D) GET
**Answer:** D
**Explanation:** GET is intended for retrieving a resource.

**BE-042** | HTTP | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which status code commonly indicates successful resource creation?
- A) 201
- B) 503
- C) 301
- D) 401
**Answer:** A
**Explanation:** 201 Created indicates that a resource was created.

**BE-043** | HTTP | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does status code 401 generally mean?
- A) The server is permanently redirected
- B) Authentication is required or has failed
- C) The request succeeded without content
- D) The resource was created
**Answer:** B
**Explanation:** 401 relates to authentication credentials.

**BE-044** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What does statelessness mean for a REST request?
- A) Responses cannot be JSON
- B) Clients never send headers
- C) Each request contains the information needed to process it
- D) The server cannot use a database
**Answer:** C
**Explanation:** The server does not rely on stored client session state between requests.

**BE-045** | REST APIs | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which response is most appropriate when a request body is invalid?
- A) 101 Switching Protocols
- B) 301 Moved Permanently
- C) 201 Created
- D) 400 Bad Request
**Answer:** D
**Explanation:** 400 indicates that the request is malformed or invalid.

**BE-046** | Authentication | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is authorization concerned with?
- A) What an authenticated user is allowed to do
- B) Creating database backups
- C) Proving a user's identity only
- D) Compressing response bodies
**Answer:** A
**Explanation:** Authorization determines permitted actions and resources.

**BE-047** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should passwords generally be stored using a password-hashing function?
- A) To make passwords visible to support staff
- B) To avoid storing recoverable plaintext passwords
- C) To send passwords in URLs
- D) To reduce every password to the same value
**Answer:** B
**Explanation:** A suitable password hash makes recovering the original password difficult.

**BE-048** | Databases | Medium
In a practical project, which statement is the most accurate?

Context: What is a primary key used for?
- A) Sorting every query automatically
- B) Encrypting a table
- C) Uniquely identifying a row
- D) Replacing all indexes
**Answer:** C
**Explanation:** A primary key uniquely identifies each record.

**BE-049** | SQL | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which SQL clause filters rows before grouping?
- A) LIMIT
- B) ORDER BY
- C) AS
- D) WHERE
**Answer:** D
**Explanation:** WHERE filters rows before GROUP BY aggregation.

**BE-050** | SQL | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which SQL command retrieves data from a table?
- A) SELECT
- B) INSERT
- C) UPDATE
- D) DROP
**Answer:** A
**Explanation:** SELECT queries rows from database tables or views.

**BE-051** | Validation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why validate input on the server even if the browser validates it?
- A) HTML validation encrypts data
- B) Clients can bypass browser-side checks
- C) Browsers never send strings
- D) Server validation slows attackers only
**Answer:** B
**Explanation:** Client-side checks improve usability but are not a security boundary.

**BE-052** | Caching | Medium
In a practical project, which statement is the most accurate?

Context: What is a typical purpose of caching?
- A) Permanently delete source data
- B) Replace authentication
- C) Reuse a previous result to reduce latency or repeated work
- D) Guarantee data is always fresh
**Answer:** C
**Explanation:** Caching can speed up reads but needs an appropriate freshness strategy.

**BE-053** | Errors | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should an API avoid returning raw stack traces to public clients?
- A) They make JSON invalid by definition
- B) They prevent HTTP from working
- C) They improve accessibility too much
- D) They may reveal implementation details or secrets
**Answer:** D
**Explanation:** Detailed traces can expose sensitive internal information.

**BE-054** | Security | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the principle of least privilege?
- A) Grant only the permissions needed for the task
- B) Share one password across services
- C) Give all users administrator rights
- D) Disable logs
**Answer:** A
**Explanation:** Least privilege limits the impact of mistakes and compromised accounts.

**BE-055** | Scalability | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a benefit of moving long-running work to a background queue?
- A) The database is no longer needed
- B) The request can respond quickly while work runs asynchronously
- C) Authentication becomes unnecessary
- D) Every job is guaranteed to succeed
**Answer:** B
**Explanation:** Queues decouple slow work from the user-facing request.

**BE-056** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: Which method is commonly used to partially update a resource?
- A) CONNECT
- B) TRACE
- C) PATCH
- D) OPTIONS only
**Answer:** C
**Explanation:** PATCH applies partial modifications to a resource.

**BE-057** | Databases | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does an index commonly improve?
- A) Every write operation in all cases
- B) Network bandwidth
- C) Data confidentiality by itself
- D) Lookup performance for selected queries
**Answer:** D
**Explanation:** Indexes can speed reads but may add storage and write overhead.

**BE-058** | SQL | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which clause sorts query results?
- A) ORDER BY
- B) VALUES
- C) WHERE
- D) HAVING only
**Answer:** A
**Explanation:** ORDER BY specifies the result ordering.

**BE-059** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should an API token be kept out of public source control?
- A) Tokens only work in private repositories
- B) Anyone who obtains it may be able to use its privileges
- C) It prevents unit testing
- D) It makes the code compile slowly
**Answer:** B
**Explanation:** Exposed credentials can enable unauthorized access.

**BE-060** | Errors | Medium
In a practical project, which statement is the most accurate?

Context: What should a backend typically do if a dependency temporarily fails?
- A) Retry forever without limits
- B) Return success regardless of outcome
- C) Handle the failure safely and return an appropriate response
- D) Expose credentials in the error message
**Answer:** C
**Explanation:** Controlled errors and bounded retries prevent cascading failures.

**BE-061** | HTTP | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which HTTP method is normally used to retrieve data?
- A) POST
- B) DELETE
- C) PATCH
- D) GET
**Answer:** D
**Explanation:** GET is intended for retrieving a resource.

**BE-062** | HTTP | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which status code commonly indicates successful resource creation?
- A) 201
- B) 503
- C) 301
- D) 401
**Answer:** A
**Explanation:** 201 Created indicates that a resource was created.

**BE-063** | HTTP | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does status code 401 generally mean?
- A) The resource was created
- B) Authentication is required or has failed
- C) The server is permanently redirected
- D) The request succeeded without content
**Answer:** B
**Explanation:** 401 relates to authentication credentials.

**BE-064** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What does statelessness mean for a REST request?
- A) Responses cannot be JSON
- B) The server cannot use a database
- C) Each request contains the information needed to process it
- D) Clients never send headers
**Answer:** C
**Explanation:** The server does not rely on stored client session state between requests.

**BE-065** | REST APIs | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which response is most appropriate when a request body is invalid?
- A) 301 Moved Permanently
- B) 101 Switching Protocols
- C) 201 Created
- D) 400 Bad Request
**Answer:** D
**Explanation:** 400 indicates that the request is malformed or invalid.

**BE-066** | Authentication | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is authorization concerned with?
- A) What an authenticated user is allowed to do
- B) Proving a user's identity only
- C) Compressing response bodies
- D) Creating database backups
**Answer:** A
**Explanation:** Authorization determines permitted actions and resources.

**BE-067** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should passwords generally be stored using a password-hashing function?
- A) To reduce every password to the same value
- B) To avoid storing recoverable plaintext passwords
- C) To send passwords in URLs
- D) To make passwords visible to support staff
**Answer:** B
**Explanation:** A suitable password hash makes recovering the original password difficult.

**BE-068** | Databases | Medium
In a practical project, which statement is the most accurate?

Context: What is a primary key used for?
- A) Replacing all indexes
- B) Encrypting a table
- C) Uniquely identifying a row
- D) Sorting every query automatically
**Answer:** C
**Explanation:** A primary key uniquely identifies each record.

**BE-069** | SQL | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which SQL clause filters rows before grouping?
- A) AS
- B) LIMIT
- C) ORDER BY
- D) WHERE
**Answer:** D
**Explanation:** WHERE filters rows before GROUP BY aggregation.

**BE-070** | SQL | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which SQL command retrieves data from a table?
- A) SELECT
- B) DROP
- C) INSERT
- D) UPDATE
**Answer:** A
**Explanation:** SELECT queries rows from database tables or views.

**BE-071** | Validation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why validate input on the server even if the browser validates it?
- A) HTML validation encrypts data
- B) Clients can bypass browser-side checks
- C) Browsers never send strings
- D) Server validation slows attackers only
**Answer:** B
**Explanation:** Client-side checks improve usability but are not a security boundary.

**BE-072** | Caching | Medium
In a practical project, which statement is the most accurate?

Context: What is a typical purpose of caching?
- A) Replace authentication
- B) Guarantee data is always fresh
- C) Reuse a previous result to reduce latency or repeated work
- D) Permanently delete source data
**Answer:** C
**Explanation:** Caching can speed up reads but needs an appropriate freshness strategy.

**BE-073** | Errors | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should an API avoid returning raw stack traces to public clients?
- A) They make JSON invalid by definition
- B) They prevent HTTP from working
- C) They improve accessibility too much
- D) They may reveal implementation details or secrets
**Answer:** D
**Explanation:** Detailed traces can expose sensitive internal information.

**BE-074** | Security | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the principle of least privilege?
- A) Grant only the permissions needed for the task
- B) Share one password across services
- C) Give all users administrator rights
- D) Disable logs
**Answer:** A
**Explanation:** Least privilege limits the impact of mistakes and compromised accounts.

**BE-075** | Scalability | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a benefit of moving long-running work to a background queue?
- A) Every job is guaranteed to succeed
- B) The request can respond quickly while work runs asynchronously
- C) The database is no longer needed
- D) Authentication becomes unnecessary
**Answer:** B
**Explanation:** Queues decouple slow work from the user-facing request.

**BE-076** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: Which method is commonly used to partially update a resource?
- A) OPTIONS only
- B) TRACE
- C) PATCH
- D) CONNECT
**Answer:** C
**Explanation:** PATCH applies partial modifications to a resource.

**BE-077** | Databases | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does an index commonly improve?
- A) Every write operation in all cases
- B) Network bandwidth
- C) Data confidentiality by itself
- D) Lookup performance for selected queries
**Answer:** D
**Explanation:** Indexes can speed reads but may add storage and write overhead.

**BE-078** | SQL | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which clause sorts query results?
- A) ORDER BY
- B) WHERE
- C) VALUES
- D) HAVING only
**Answer:** A
**Explanation:** ORDER BY specifies the result ordering.

**BE-079** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should an API token be kept out of public source control?
- A) It prevents unit testing
- B) Anyone who obtains it may be able to use its privileges
- C) It makes the code compile slowly
- D) Tokens only work in private repositories
**Answer:** B
**Explanation:** Exposed credentials can enable unauthorized access.

**BE-080** | Errors | Medium
In a practical project, which statement is the most accurate?

Context: What should a backend typically do if a dependency temporarily fails?
- A) Retry forever without limits
- B) Expose credentials in the error message
- C) Handle the failure safely and return an appropriate response
- D) Return success regardless of outcome
**Answer:** C
**Explanation:** Controlled errors and bounded retries prevent cascading failures.

**BE-081** | HTTP | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which HTTP method is normally used to retrieve data?
- A) POST
- B) PATCH
- C) DELETE
- D) GET
**Answer:** D
**Explanation:** GET is intended for retrieving a resource.

**BE-082** | HTTP | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which status code commonly indicates successful resource creation?
- A) 201
- B) 301
- C) 401
- D) 503
**Answer:** A
**Explanation:** 201 Created indicates that a resource was created.

**BE-083** | HTTP | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does status code 401 generally mean?
- A) The resource was created
- B) Authentication is required or has failed
- C) The server is permanently redirected
- D) The request succeeded without content
**Answer:** B
**Explanation:** 401 relates to authentication credentials.

**BE-084** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What does statelessness mean for a REST request?
- A) Clients never send headers
- B) Responses cannot be JSON
- C) Each request contains the information needed to process it
- D) The server cannot use a database
**Answer:** C
**Explanation:** The server does not rely on stored client session state between requests.

**BE-085** | REST APIs | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which response is most appropriate when a request body is invalid?
- A) 201 Created
- B) 101 Switching Protocols
- C) 301 Moved Permanently
- D) 400 Bad Request
**Answer:** D
**Explanation:** 400 indicates that the request is malformed or invalid.

**BE-086** | Authentication | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is authorization concerned with?
- A) What an authenticated user is allowed to do
- B) Compressing response bodies
- C) Creating database backups
- D) Proving a user's identity only
**Answer:** A
**Explanation:** Authorization determines permitted actions and resources.

**BE-087** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should passwords generally be stored using a password-hashing function?
- A) To reduce every password to the same value
- B) To avoid storing recoverable plaintext passwords
- C) To send passwords in URLs
- D) To make passwords visible to support staff
**Answer:** B
**Explanation:** A suitable password hash makes recovering the original password difficult.

**BE-088** | Databases | Medium
In a practical project, which statement is the most accurate?

Context: What is a primary key used for?
- A) Replacing all indexes
- B) Sorting every query automatically
- C) Uniquely identifying a row
- D) Encrypting a table
**Answer:** C
**Explanation:** A primary key uniquely identifies each record.

**BE-089** | SQL | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which SQL clause filters rows before grouping?
- A) LIMIT
- B) AS
- C) ORDER BY
- D) WHERE
**Answer:** D
**Explanation:** WHERE filters rows before GROUP BY aggregation.

**BE-090** | SQL | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which SQL command retrieves data from a table?
- A) SELECT
- B) DROP
- C) INSERT
- D) UPDATE
**Answer:** A
**Explanation:** SELECT queries rows from database tables or views.

**BE-091** | Validation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why validate input on the server even if the browser validates it?
- A) HTML validation encrypts data
- B) Clients can bypass browser-side checks
- C) Browsers never send strings
- D) Server validation slows attackers only
**Answer:** B
**Explanation:** Client-side checks improve usability but are not a security boundary.

**BE-092** | Caching | Medium
In a practical project, which statement is the most accurate?

Context: What is a typical purpose of caching?
- A) Permanently delete source data
- B) Guarantee data is always fresh
- C) Reuse a previous result to reduce latency or repeated work
- D) Replace authentication
**Answer:** C
**Explanation:** Caching can speed up reads but needs an appropriate freshness strategy.

**BE-093** | Errors | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should an API avoid returning raw stack traces to public clients?
- A) They prevent HTTP from working
- B) They make JSON invalid by definition
- C) They improve accessibility too much
- D) They may reveal implementation details or secrets
**Answer:** D
**Explanation:** Detailed traces can expose sensitive internal information.

**BE-094** | Security | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the principle of least privilege?
- A) Grant only the permissions needed for the task
- B) Give all users administrator rights
- C) Share one password across services
- D) Disable logs
**Answer:** A
**Explanation:** Least privilege limits the impact of mistakes and compromised accounts.

**BE-095** | Scalability | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a benefit of moving long-running work to a background queue?
- A) Every job is guaranteed to succeed
- B) The request can respond quickly while work runs asynchronously
- C) Authentication becomes unnecessary
- D) The database is no longer needed
**Answer:** B
**Explanation:** Queues decouple slow work from the user-facing request.

**BE-096** | REST APIs | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Which method is commonly used to partially update a resource?
- A) TRACE
- B) OPTIONS only
- C) PATCH
- D) CONNECT
**Answer:** C
**Explanation:** PATCH applies partial modifications to a resource.

**BE-097** | Databases | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: What does an index commonly improve?
- A) Network bandwidth
- B) Data confidentiality by itself
- C) Every write operation in all cases
- D) Lookup performance for selected queries
**Answer:** D
**Explanation:** Indexes can speed reads but may add storage and write overhead.

**BE-098** | SQL | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: Which clause sorts query results?
- A) ORDER BY
- B) VALUES
- C) HAVING only
- D) WHERE
**Answer:** A
**Explanation:** ORDER BY specifies the result ordering.

**BE-099** | Authentication | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: Why should an API token be kept out of public source control?
- A) Tokens only work in private repositories
- B) Anyone who obtains it may be able to use its privileges
- C) It makes the code compile slowly
- D) It prevents unit testing
**Answer:** B
**Explanation:** Exposed credentials can enable unauthorized access.

**BE-100** | Errors | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What should a backend typically do if a dependency temporarily fails?
- A) Return success regardless of outcome
- B) Retry forever without limits
- C) Handle the failure safely and return an appropriate response
- D) Expose credentials in the error message
**Answer:** C
**Explanation:** Controlled errors and bounded retries prevent cascading failures.


# FS — Full Stack

**FS-001** | Integration | Basic
A React page calls an API on another port and the browser reports CORS. What should be checked first?
- A) The CSS font family
- B) The user's keyboard layout
- C) Backend CORS policy and response headers
- D) The database table color
**Answer:** C
**Explanation:** The server must allow the intended origin and request.

**FS-002** | REST APIs | Basic
Where should shared API request logic often live in a frontend app?
- A) Only in image filenames
- B) In the browser address bar
- C) Inside every CSS file
- D) A reusable API client or service module
**Answer:** D
**Explanation:** Centralized API logic reduces duplication and standardizes error handling.

**FS-003** | Authentication | Basic
What is a common purpose of a signed access token?
- A) Carry verifiable claims used to authorize requests
- B) Compress images
- C) Replace HTTPS
- D) Store raw passwords
**Answer:** A
**Explanation:** The server can validate the token's signature and relevant claims.

**FS-004** | Databases | Basic
Why should database credentials not be placed in frontend JavaScript?
- A) It prevents CSS rendering
- B) Frontend code is delivered to users and can be inspected
- C) Browsers encrypt all source automatically
- D) JavaScript cannot make requests
**Answer:** B
**Explanation:** Secrets must remain on trusted server-side infrastructure.

**FS-005** | CORS | Basic
Does CORS replace authentication?
- A) Yes, CORS encrypts the database
- B) No, because CORS is a CSS property
- C) No; CORS controls browser cross-origin access, not user identity
- D) Yes, CORS logs users in
**Answer:** C
**Explanation:** CORS is not an authentication or authorization mechanism.

**FS-006** | Deployment | Basic
Why can an app work locally but fail after deployment?
- A) Browsers remove all APIs in production
- B) HTML cannot be hosted publicly
- C) Production always uses the same environment
- D) Environment variables, paths, origins, or server configuration may differ
**Answer:** D
**Explanation:** Deployment environments often differ in configuration and networking.

**FS-007** | State | Basic
What is a common benefit of keeping server data separate from transient UI state?
- A) It clarifies ownership and makes updates easier to reason about
- B) It guarantees no bugs
- C) It makes every component global
- D) It removes the need for APIs
**Answer:** A
**Explanation:** Different state types have different lifecycles and update rules.

**FS-008** | Validation | Basic
Where should business-critical validation be enforced?
- A) Only in CSS
- B) On the server, with optional client-side feedback
- C) Only after saving without checks
- D) Only in placeholder text
**Answer:** B
**Explanation:** The server is the trusted boundary for enforcing rules.

**FS-009** | Debugging | Basic
An API returns 500. Which next step is most useful?
- A) Delete the database immediately
- B) Disable all tests
- C) Inspect server logs and reproduce the request
- D) Change the button color
**Answer:** C
**Explanation:** Server logs and a reproducible request help locate the failure.

**FS-010** | Architecture | Basic
What is the purpose of separating frontend and backend responsibilities?
- A) Remove the need for testing
- B) Force both layers to use one language
- C) Prevent all network failures
- D) Create clearer interfaces and independent responsibilities
**Answer:** D
**Explanation:** Clear boundaries improve maintainability and testability.

**FS-011** | Integration | Basic
What should the UI show while a slow API request is pending?
- A) A loading state and prevent confusing duplicate actions when appropriate
- B) A fake success message
- C) A stack trace
- D) A blank page forever
**Answer:** A
**Explanation:** A clear pending state communicates progress and reduces accidental repeat submissions.

**FS-012** | REST APIs | Basic
What should a frontend do when an API returns a non-success status?
- A) Assume the response is successful JSON
- B) Handle the response and show an appropriate error or recovery path
- C) Ignore the status code
- D) Delete local user data
**Answer:** B
**Explanation:** Network requests can complete with HTTP error responses that need explicit handling.

**FS-013** | Authentication | Basic
Why is checking a role only in the frontend insufficient?
- A) Roles cannot be displayed in HTML
- B) APIs cannot inspect users
- C) A user can call backend endpoints without using the UI
- D) Frontend checks are always slower
**Answer:** C
**Explanation:** The backend must enforce authorization on every protected operation.

**FS-014** | Databases | Basic
What does a database transaction help provide?
- A) A guarantee that all queries are free
- B) Automatic UI styling
- C) A replacement for backups
- D) A group of operations that succeed or fail together under defined guarantees
**Answer:** D
**Explanation:** Transactions help maintain consistency across related changes.

**FS-015** | Deployment | Basic
What should be configured separately for development and production?
- A) Environment-specific API URLs and secrets
- B) The meaning of HTTP
- C) HTML heading levels
- D) The names of JavaScript operators
**Answer:** A
**Explanation:** Environment configuration avoids hard-coded endpoints and leaked secrets.

**FS-016** | CORS | Basic
A preflight request is commonly associated with which HTTP method?
- A) CONNECT only
- B) OPTIONS
- C) TRACE only
- D) DELETE only
**Answer:** B
**Explanation:** Browsers use OPTIONS preflight requests to check cross-origin permissions.

**FS-017** | State | Basic
Why can stale state cause a UI bug?
- A) State is always stored on the server
- B) The database changes CSS directly
- C) The component may render using an outdated value
- D) It disables HTTP
**Answer:** C
**Explanation:** State updates and asynchronous operations need careful handling.

**FS-018** | Validation | Basic
Why validate API response shapes in a frontend app?
- A) It prevents all network latency
- B) It encrypts data automatically
- C) It makes the server trust the browser
- D) Unexpected or missing fields can otherwise break rendering or logic
**Answer:** D
**Explanation:** Checking response structure helps handle contract changes safely.

**FS-019** | Debugging | Basic
A form submits twice after one click. What should be investigated?
- A) Repeated event handlers, default submission behavior, and pending-state handling
- B) The monitor brightness
- C) Image compression only
- D) The DNS provider's logo
**Answer:** A
**Explanation:** Duplicate handlers or submission paths can trigger repeated requests.

**FS-020** | Architecture | Basic
What is an API contract?
- A) A browser extension
- B) An agreed definition of endpoints, inputs, outputs, and errors
- C) A database password
- D) A website's visual theme
**Answer:** B
**Explanation:** A clear contract lets frontend and backend integrate consistently.

**FS-021** | Integration | Basic
A React page calls an API on another port and the browser reports CORS. What should be checked first?
- A) The database table color
- B) The CSS font family
- C) Backend CORS policy and response headers
- D) The user's keyboard layout
**Answer:** C
**Explanation:** The server must allow the intended origin and request.

**FS-022** | REST APIs | Basic
Where should shared API request logic often live in a frontend app?
- A) Inside every CSS file
- B) In the browser address bar
- C) Only in image filenames
- D) A reusable API client or service module
**Answer:** D
**Explanation:** Centralized API logic reduces duplication and standardizes error handling.

**FS-023** | Authentication | Basic
What is a common purpose of a signed access token?
- A) Carry verifiable claims used to authorize requests
- B) Replace HTTPS
- C) Compress images
- D) Store raw passwords
**Answer:** A
**Explanation:** The server can validate the token's signature and relevant claims.

**FS-024** | Databases | Basic
Why should database credentials not be placed in frontend JavaScript?
- A) Browsers encrypt all source automatically
- B) Frontend code is delivered to users and can be inspected
- C) JavaScript cannot make requests
- D) It prevents CSS rendering
**Answer:** B
**Explanation:** Secrets must remain on trusted server-side infrastructure.

**FS-025** | CORS | Basic
Does CORS replace authentication?
- A) Yes, CORS logs users in
- B) Yes, CORS encrypts the database
- C) No; CORS controls browser cross-origin access, not user identity
- D) No, because CORS is a CSS property
**Answer:** C
**Explanation:** CORS is not an authentication or authorization mechanism.

**FS-026** | Deployment | Basic
Why can an app work locally but fail after deployment?
- A) HTML cannot be hosted publicly
- B) Production always uses the same environment
- C) Browsers remove all APIs in production
- D) Environment variables, paths, origins, or server configuration may differ
**Answer:** D
**Explanation:** Deployment environments often differ in configuration and networking.

**FS-027** | State | Basic
What is a common benefit of keeping server data separate from transient UI state?
- A) It clarifies ownership and makes updates easier to reason about
- B) It removes the need for APIs
- C) It guarantees no bugs
- D) It makes every component global
**Answer:** A
**Explanation:** Different state types have different lifecycles and update rules.

**FS-028** | Validation | Basic
Where should business-critical validation be enforced?
- A) Only after saving without checks
- B) On the server, with optional client-side feedback
- C) Only in CSS
- D) Only in placeholder text
**Answer:** B
**Explanation:** The server is the trusted boundary for enforcing rules.

**FS-029** | Debugging | Basic
An API returns 500. Which next step is most useful?
- A) Change the button color
- B) Delete the database immediately
- C) Inspect server logs and reproduce the request
- D) Disable all tests
**Answer:** C
**Explanation:** Server logs and a reproducible request help locate the failure.

**FS-030** | Architecture | Basic
What is the purpose of separating frontend and backend responsibilities?
- A) Force both layers to use one language
- B) Remove the need for testing
- C) Prevent all network failures
- D) Create clearer interfaces and independent responsibilities
**Answer:** D
**Explanation:** Clear boundaries improve maintainability and testability.

**FS-031** | Integration | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should the UI show while a slow API request is pending?
- A) A loading state and prevent confusing duplicate actions when appropriate
- B) A stack trace
- C) A blank page forever
- D) A fake success message
**Answer:** A
**Explanation:** A clear pending state communicates progress and reduces accidental repeat submissions.

**FS-032** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What should a frontend do when an API returns a non-success status?
- A) Delete local user data
- B) Handle the response and show an appropriate error or recovery path
- C) Ignore the status code
- D) Assume the response is successful JSON
**Answer:** B
**Explanation:** Network requests can complete with HTTP error responses that need explicit handling.

**FS-033** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why is checking a role only in the frontend insufficient?
- A) Frontend checks are always slower
- B) APIs cannot inspect users
- C) A user can call backend endpoints without using the UI
- D) Roles cannot be displayed in HTML
**Answer:** C
**Explanation:** The backend must enforce authorization on every protected operation.

**FS-034** | Databases | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a database transaction help provide?
- A) Automatic UI styling
- B) A guarantee that all queries are free
- C) A replacement for backups
- D) A group of operations that succeed or fail together under defined guarantees
**Answer:** D
**Explanation:** Transactions help maintain consistency across related changes.

**FS-035** | Deployment | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should be configured separately for development and production?
- A) Environment-specific API URLs and secrets
- B) HTML heading levels
- C) The names of JavaScript operators
- D) The meaning of HTTP
**Answer:** A
**Explanation:** Environment configuration avoids hard-coded endpoints and leaked secrets.

**FS-036** | CORS | Medium
In a practical project, which statement is the most accurate?

Context: A preflight request is commonly associated with which HTTP method?
- A) TRACE only
- B) OPTIONS
- C) DELETE only
- D) CONNECT only
**Answer:** B
**Explanation:** Browsers use OPTIONS preflight requests to check cross-origin permissions.

**FS-037** | State | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why can stale state cause a UI bug?
- A) It disables HTTP
- B) The database changes CSS directly
- C) The component may render using an outdated value
- D) State is always stored on the server
**Answer:** C
**Explanation:** State updates and asynchronous operations need careful handling.

**FS-038** | Validation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why validate API response shapes in a frontend app?
- A) It encrypts data automatically
- B) It prevents all network latency
- C) It makes the server trust the browser
- D) Unexpected or missing fields can otherwise break rendering or logic
**Answer:** D
**Explanation:** Checking response structure helps handle contract changes safely.

**FS-039** | Debugging | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A form submits twice after one click. What should be investigated?
- A) Repeated event handlers, default submission behavior, and pending-state handling
- B) Image compression only
- C) The monitor brightness
- D) The DNS provider's logo
**Answer:** A
**Explanation:** Duplicate handlers or submission paths can trigger repeated requests.

**FS-040** | Architecture | Medium
In a practical project, which statement is the most accurate?

Context: What is an API contract?
- A) A website's visual theme
- B) An agreed definition of endpoints, inputs, outputs, and errors
- C) A browser extension
- D) A database password
**Answer:** B
**Explanation:** A clear contract lets frontend and backend integrate consistently.

**FS-041** | Integration | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A React page calls an API on another port and the browser reports CORS. What should be checked first?
- A) The CSS font family
- B) The database table color
- C) Backend CORS policy and response headers
- D) The user's keyboard layout
**Answer:** C
**Explanation:** The server must allow the intended origin and request.

**FS-042** | REST APIs | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Where should shared API request logic often live in a frontend app?
- A) Only in image filenames
- B) In the browser address bar
- C) Inside every CSS file
- D) A reusable API client or service module
**Answer:** D
**Explanation:** Centralized API logic reduces duplication and standardizes error handling.

**FS-043** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common purpose of a signed access token?
- A) Carry verifiable claims used to authorize requests
- B) Store raw passwords
- C) Replace HTTPS
- D) Compress images
**Answer:** A
**Explanation:** The server can validate the token's signature and relevant claims.

**FS-044** | Databases | Medium
In a practical project, which statement is the most accurate?

Context: Why should database credentials not be placed in frontend JavaScript?
- A) It prevents CSS rendering
- B) Frontend code is delivered to users and can be inspected
- C) JavaScript cannot make requests
- D) Browsers encrypt all source automatically
**Answer:** B
**Explanation:** Secrets must remain on trusted server-side infrastructure.

**FS-045** | CORS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Does CORS replace authentication?
- A) No, because CORS is a CSS property
- B) Yes, CORS logs users in
- C) No; CORS controls browser cross-origin access, not user identity
- D) Yes, CORS encrypts the database
**Answer:** C
**Explanation:** CORS is not an authentication or authorization mechanism.

**FS-046** | Deployment | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why can an app work locally but fail after deployment?
- A) Browsers remove all APIs in production
- B) Production always uses the same environment
- C) HTML cannot be hosted publicly
- D) Environment variables, paths, origins, or server configuration may differ
**Answer:** D
**Explanation:** Deployment environments often differ in configuration and networking.

**FS-047** | State | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common benefit of keeping server data separate from transient UI state?
- A) It clarifies ownership and makes updates easier to reason about
- B) It guarantees no bugs
- C) It makes every component global
- D) It removes the need for APIs
**Answer:** A
**Explanation:** Different state types have different lifecycles and update rules.

**FS-048** | Validation | Medium
In a practical project, which statement is the most accurate?

Context: Where should business-critical validation be enforced?
- A) Only after saving without checks
- B) On the server, with optional client-side feedback
- C) Only in CSS
- D) Only in placeholder text
**Answer:** B
**Explanation:** The server is the trusted boundary for enforcing rules.

**FS-049** | Debugging | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: An API returns 500. Which next step is most useful?
- A) Change the button color
- B) Delete the database immediately
- C) Inspect server logs and reproduce the request
- D) Disable all tests
**Answer:** C
**Explanation:** Server logs and a reproducible request help locate the failure.

**FS-050** | Architecture | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the purpose of separating frontend and backend responsibilities?
- A) Force both layers to use one language
- B) Prevent all network failures
- C) Remove the need for testing
- D) Create clearer interfaces and independent responsibilities
**Answer:** D
**Explanation:** Clear boundaries improve maintainability and testability.

**FS-051** | Integration | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should the UI show while a slow API request is pending?
- A) A loading state and prevent confusing duplicate actions when appropriate
- B) A stack trace
- C) A blank page forever
- D) A fake success message
**Answer:** A
**Explanation:** A clear pending state communicates progress and reduces accidental repeat submissions.

**FS-052** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What should a frontend do when an API returns a non-success status?
- A) Assume the response is successful JSON
- B) Handle the response and show an appropriate error or recovery path
- C) Delete local user data
- D) Ignore the status code
**Answer:** B
**Explanation:** Network requests can complete with HTTP error responses that need explicit handling.

**FS-053** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why is checking a role only in the frontend insufficient?
- A) Frontend checks are always slower
- B) Roles cannot be displayed in HTML
- C) A user can call backend endpoints without using the UI
- D) APIs cannot inspect users
**Answer:** C
**Explanation:** The backend must enforce authorization on every protected operation.

**FS-054** | Databases | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a database transaction help provide?
- A) A guarantee that all queries are free
- B) A replacement for backups
- C) Automatic UI styling
- D) A group of operations that succeed or fail together under defined guarantees
**Answer:** D
**Explanation:** Transactions help maintain consistency across related changes.

**FS-055** | Deployment | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should be configured separately for development and production?
- A) Environment-specific API URLs and secrets
- B) The meaning of HTTP
- C) HTML heading levels
- D) The names of JavaScript operators
**Answer:** A
**Explanation:** Environment configuration avoids hard-coded endpoints and leaked secrets.

**FS-056** | CORS | Medium
In a practical project, which statement is the most accurate?

Context: A preflight request is commonly associated with which HTTP method?
- A) CONNECT only
- B) OPTIONS
- C) TRACE only
- D) DELETE only
**Answer:** B
**Explanation:** Browsers use OPTIONS preflight requests to check cross-origin permissions.

**FS-057** | State | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why can stale state cause a UI bug?
- A) State is always stored on the server
- B) The database changes CSS directly
- C) The component may render using an outdated value
- D) It disables HTTP
**Answer:** C
**Explanation:** State updates and asynchronous operations need careful handling.

**FS-058** | Validation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why validate API response shapes in a frontend app?
- A) It makes the server trust the browser
- B) It encrypts data automatically
- C) It prevents all network latency
- D) Unexpected or missing fields can otherwise break rendering or logic
**Answer:** D
**Explanation:** Checking response structure helps handle contract changes safely.

**FS-059** | Debugging | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A form submits twice after one click. What should be investigated?
- A) Repeated event handlers, default submission behavior, and pending-state handling
- B) The monitor brightness
- C) Image compression only
- D) The DNS provider's logo
**Answer:** A
**Explanation:** Duplicate handlers or submission paths can trigger repeated requests.

**FS-060** | Architecture | Medium
In a practical project, which statement is the most accurate?

Context: What is an API contract?
- A) A browser extension
- B) An agreed definition of endpoints, inputs, outputs, and errors
- C) A website's visual theme
- D) A database password
**Answer:** B
**Explanation:** A clear contract lets frontend and backend integrate consistently.

**FS-061** | Integration | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A React page calls an API on another port and the browser reports CORS. What should be checked first?
- A) The CSS font family
- B) The database table color
- C) Backend CORS policy and response headers
- D) The user's keyboard layout
**Answer:** C
**Explanation:** The server must allow the intended origin and request.

**FS-062** | REST APIs | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Where should shared API request logic often live in a frontend app?
- A) Inside every CSS file
- B) In the browser address bar
- C) Only in image filenames
- D) A reusable API client or service module
**Answer:** D
**Explanation:** Centralized API logic reduces duplication and standardizes error handling.

**FS-063** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common purpose of a signed access token?
- A) Carry verifiable claims used to authorize requests
- B) Replace HTTPS
- C) Compress images
- D) Store raw passwords
**Answer:** A
**Explanation:** The server can validate the token's signature and relevant claims.

**FS-064** | Databases | Medium
In a practical project, which statement is the most accurate?

Context: Why should database credentials not be placed in frontend JavaScript?
- A) It prevents CSS rendering
- B) Frontend code is delivered to users and can be inspected
- C) Browsers encrypt all source automatically
- D) JavaScript cannot make requests
**Answer:** B
**Explanation:** Secrets must remain on trusted server-side infrastructure.

**FS-065** | CORS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Does CORS replace authentication?
- A) Yes, CORS logs users in
- B) No, because CORS is a CSS property
- C) No; CORS controls browser cross-origin access, not user identity
- D) Yes, CORS encrypts the database
**Answer:** C
**Explanation:** CORS is not an authentication or authorization mechanism.

**FS-066** | Deployment | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why can an app work locally but fail after deployment?
- A) Browsers remove all APIs in production
- B) Production always uses the same environment
- C) HTML cannot be hosted publicly
- D) Environment variables, paths, origins, or server configuration may differ
**Answer:** D
**Explanation:** Deployment environments often differ in configuration and networking.

**FS-067** | State | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common benefit of keeping server data separate from transient UI state?
- A) It clarifies ownership and makes updates easier to reason about
- B) It makes every component global
- C) It removes the need for APIs
- D) It guarantees no bugs
**Answer:** A
**Explanation:** Different state types have different lifecycles and update rules.

**FS-068** | Validation | Medium
In a practical project, which statement is the most accurate?

Context: Where should business-critical validation be enforced?
- A) Only in CSS
- B) On the server, with optional client-side feedback
- C) Only in placeholder text
- D) Only after saving without checks
**Answer:** B
**Explanation:** The server is the trusted boundary for enforcing rules.

**FS-069** | Debugging | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: An API returns 500. Which next step is most useful?
- A) Change the button color
- B) Disable all tests
- C) Inspect server logs and reproduce the request
- D) Delete the database immediately
**Answer:** C
**Explanation:** Server logs and a reproducible request help locate the failure.

**FS-070** | Architecture | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the purpose of separating frontend and backend responsibilities?
- A) Force both layers to use one language
- B) Prevent all network failures
- C) Remove the need for testing
- D) Create clearer interfaces and independent responsibilities
**Answer:** D
**Explanation:** Clear boundaries improve maintainability and testability.

**FS-071** | Integration | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should the UI show while a slow API request is pending?
- A) A loading state and prevent confusing duplicate actions when appropriate
- B) A blank page forever
- C) A fake success message
- D) A stack trace
**Answer:** A
**Explanation:** A clear pending state communicates progress and reduces accidental repeat submissions.

**FS-072** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What should a frontend do when an API returns a non-success status?
- A) Delete local user data
- B) Handle the response and show an appropriate error or recovery path
- C) Assume the response is successful JSON
- D) Ignore the status code
**Answer:** B
**Explanation:** Network requests can complete with HTTP error responses that need explicit handling.

**FS-073** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why is checking a role only in the frontend insufficient?
- A) Roles cannot be displayed in HTML
- B) APIs cannot inspect users
- C) A user can call backend endpoints without using the UI
- D) Frontend checks are always slower
**Answer:** C
**Explanation:** The backend must enforce authorization on every protected operation.

**FS-074** | Databases | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a database transaction help provide?
- A) A replacement for backups
- B) Automatic UI styling
- C) A guarantee that all queries are free
- D) A group of operations that succeed or fail together under defined guarantees
**Answer:** D
**Explanation:** Transactions help maintain consistency across related changes.

**FS-075** | Deployment | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should be configured separately for development and production?
- A) Environment-specific API URLs and secrets
- B) The names of JavaScript operators
- C) HTML heading levels
- D) The meaning of HTTP
**Answer:** A
**Explanation:** Environment configuration avoids hard-coded endpoints and leaked secrets.

**FS-076** | CORS | Medium
In a practical project, which statement is the most accurate?

Context: A preflight request is commonly associated with which HTTP method?
- A) DELETE only
- B) OPTIONS
- C) TRACE only
- D) CONNECT only
**Answer:** B
**Explanation:** Browsers use OPTIONS preflight requests to check cross-origin permissions.

**FS-077** | State | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why can stale state cause a UI bug?
- A) It disables HTTP
- B) The database changes CSS directly
- C) The component may render using an outdated value
- D) State is always stored on the server
**Answer:** C
**Explanation:** State updates and asynchronous operations need careful handling.

**FS-078** | Validation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why validate API response shapes in a frontend app?
- A) It makes the server trust the browser
- B) It encrypts data automatically
- C) It prevents all network latency
- D) Unexpected or missing fields can otherwise break rendering or logic
**Answer:** D
**Explanation:** Checking response structure helps handle contract changes safely.

**FS-079** | Debugging | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A form submits twice after one click. What should be investigated?
- A) Repeated event handlers, default submission behavior, and pending-state handling
- B) The monitor brightness
- C) The DNS provider's logo
- D) Image compression only
**Answer:** A
**Explanation:** Duplicate handlers or submission paths can trigger repeated requests.

**FS-080** | Architecture | Medium
In a practical project, which statement is the most accurate?

Context: What is an API contract?
- A) A website's visual theme
- B) An agreed definition of endpoints, inputs, outputs, and errors
- C) A database password
- D) A browser extension
**Answer:** B
**Explanation:** A clear contract lets frontend and backend integrate consistently.

**FS-081** | Integration | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A React page calls an API on another port and the browser reports CORS. What should be checked first?
- A) The CSS font family
- B) The user's keyboard layout
- C) Backend CORS policy and response headers
- D) The database table color
**Answer:** C
**Explanation:** The server must allow the intended origin and request.

**FS-082** | REST APIs | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Where should shared API request logic often live in a frontend app?
- A) Inside every CSS file
- B) Only in image filenames
- C) In the browser address bar
- D) A reusable API client or service module
**Answer:** D
**Explanation:** Centralized API logic reduces duplication and standardizes error handling.

**FS-083** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common purpose of a signed access token?
- A) Carry verifiable claims used to authorize requests
- B) Store raw passwords
- C) Compress images
- D) Replace HTTPS
**Answer:** A
**Explanation:** The server can validate the token's signature and relevant claims.

**FS-084** | Databases | Medium
In a practical project, which statement is the most accurate?

Context: Why should database credentials not be placed in frontend JavaScript?
- A) Browsers encrypt all source automatically
- B) Frontend code is delivered to users and can be inspected
- C) It prevents CSS rendering
- D) JavaScript cannot make requests
**Answer:** B
**Explanation:** Secrets must remain on trusted server-side infrastructure.

**FS-085** | CORS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Does CORS replace authentication?
- A) No, because CORS is a CSS property
- B) Yes, CORS logs users in
- C) No; CORS controls browser cross-origin access, not user identity
- D) Yes, CORS encrypts the database
**Answer:** C
**Explanation:** CORS is not an authentication or authorization mechanism.

**FS-086** | Deployment | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why can an app work locally but fail after deployment?
- A) HTML cannot be hosted publicly
- B) Production always uses the same environment
- C) Browsers remove all APIs in production
- D) Environment variables, paths, origins, or server configuration may differ
**Answer:** D
**Explanation:** Deployment environments often differ in configuration and networking.

**FS-087** | State | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common benefit of keeping server data separate from transient UI state?
- A) It clarifies ownership and makes updates easier to reason about
- B) It guarantees no bugs
- C) It makes every component global
- D) It removes the need for APIs
**Answer:** A
**Explanation:** Different state types have different lifecycles and update rules.

**FS-088** | Validation | Medium
In a practical project, which statement is the most accurate?

Context: Where should business-critical validation be enforced?
- A) Only in CSS
- B) On the server, with optional client-side feedback
- C) Only in placeholder text
- D) Only after saving without checks
**Answer:** B
**Explanation:** The server is the trusted boundary for enforcing rules.

**FS-089** | Debugging | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: An API returns 500. Which next step is most useful?
- A) Delete the database immediately
- B) Change the button color
- C) Inspect server logs and reproduce the request
- D) Disable all tests
**Answer:** C
**Explanation:** Server logs and a reproducible request help locate the failure.

**FS-090** | Architecture | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the purpose of separating frontend and backend responsibilities?
- A) Force both layers to use one language
- B) Remove the need for testing
- C) Prevent all network failures
- D) Create clearer interfaces and independent responsibilities
**Answer:** D
**Explanation:** Clear boundaries improve maintainability and testability.

**FS-091** | Integration | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should the UI show while a slow API request is pending?
- A) A loading state and prevent confusing duplicate actions when appropriate
- B) A fake success message
- C) A blank page forever
- D) A stack trace
**Answer:** A
**Explanation:** A clear pending state communicates progress and reduces accidental repeat submissions.

**FS-092** | REST APIs | Medium
In a practical project, which statement is the most accurate?

Context: What should a frontend do when an API returns a non-success status?
- A) Delete local user data
- B) Handle the response and show an appropriate error or recovery path
- C) Assume the response is successful JSON
- D) Ignore the status code
**Answer:** B
**Explanation:** Network requests can complete with HTTP error responses that need explicit handling.

**FS-093** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why is checking a role only in the frontend insufficient?
- A) Roles cannot be displayed in HTML
- B) APIs cannot inspect users
- C) A user can call backend endpoints without using the UI
- D) Frontend checks are always slower
**Answer:** C
**Explanation:** The backend must enforce authorization on every protected operation.

**FS-094** | Databases | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a database transaction help provide?
- A) A replacement for backups
- B) A guarantee that all queries are free
- C) Automatic UI styling
- D) A group of operations that succeed or fail together under defined guarantees
**Answer:** D
**Explanation:** Transactions help maintain consistency across related changes.

**FS-095** | Deployment | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should be configured separately for development and production?
- A) Environment-specific API URLs and secrets
- B) The meaning of HTTP
- C) The names of JavaScript operators
- D) HTML heading levels
**Answer:** A
**Explanation:** Environment configuration avoids hard-coded endpoints and leaked secrets.

**FS-096** | CORS | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: A preflight request is commonly associated with which HTTP method?
- A) CONNECT only
- B) OPTIONS
- C) DELETE only
- D) TRACE only
**Answer:** B
**Explanation:** Browsers use OPTIONS preflight requests to check cross-origin permissions.

**FS-097** | State | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: Why can stale state cause a UI bug?
- A) The database changes CSS directly
- B) State is always stored on the server
- C) The component may render using an outdated value
- D) It disables HTTP
**Answer:** C
**Explanation:** State updates and asynchronous operations need careful handling.

**FS-098** | Validation | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: Why validate API response shapes in a frontend app?
- A) It encrypts data automatically
- B) It makes the server trust the browser
- C) It prevents all network latency
- D) Unexpected or missing fields can otherwise break rendering or logic
**Answer:** D
**Explanation:** Checking response structure helps handle contract changes safely.

**FS-099** | Debugging | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: A form submits twice after one click. What should be investigated?
- A) Repeated event handlers, default submission behavior, and pending-state handling
- B) Image compression only
- C) The DNS provider's logo
- D) The monitor brightness
**Answer:** A
**Explanation:** Duplicate handlers or submission paths can trigger repeated requests.

**FS-100** | Architecture | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What is an API contract?
- A) A browser extension
- B) An agreed definition of endpoints, inputs, outputs, and errors
- C) A website's visual theme
- D) A database password
**Answer:** B
**Explanation:** A clear contract lets frontend and backend integrate consistently.


# AI — AI

**AI-001** | Fundamentals | Basic
What is the main goal of artificial intelligence?
- A) Make every program use the internet
- B) Replace all databases
- C) Build systems that perform tasks requiring intelligent behavior
- D) Increase monitor resolution
**Answer:** C
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-002** | Search | Basic
Which algorithm explores the shallowest unexpanded nodes first?
- A) Bubble sort
- B) Gradient descent
- C) Depth-first search
- D) Breadth-first search
**Answer:** D
**Explanation:** Breadth-first search explores level by level.

**AI-003** | Search | Basic
What is a heuristic in informed search?
- A) An estimate of the remaining cost to a goal
- B) A guaranteed final answer
- C) A programming language
- D) A database password
**Answer:** A
**Explanation:** A heuristic guides search using an estimate.

**AI-004** | Knowledge Representation | Basic
Why represent facts in a knowledge base?
- A) To set page colors
- B) To support reasoning over stored information
- C) To replace all input validation
- D) To compress every image
**Answer:** B
**Explanation:** Structured facts can be used by inference procedures.

**AI-005** | Reasoning | Basic
In a rule-based system, what does an IF-THEN rule express?
- A) A network port
- B) A database backup
- C) A condition and its resulting conclusion or action
- D) A video format
**Answer:** C
**Explanation:** Rules encode relationships used for inference.

**AI-006** | Planning | Basic
What is the purpose of an AI planning system?
- A) Only classify images
- B) Randomly change source code
- C) Measure internet speed
- D) Find a sequence of actions to reach a goal
**Answer:** D
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-007** | NLP | Basic
Which task is an example of natural language processing?
- A) Classifying the sentiment of a review
- B) Routing a network cable
- C) Measuring CPU temperature
- D) Resizing a screen
**Answer:** A
**Explanation:** Sentiment analysis processes human language.

**AI-008** | Computer Vision | Basic
Which task belongs to computer vision?
- A) Summarizing a SQL index
- B) Detecting objects in an image
- C) Encrypting a password
- D) Scheduling a meeting by hand
**Answer:** B
**Explanation:** Computer vision extracts information from images or video.

**AI-009** | Agents | Basic
What is an intelligent agent's typical cycle?
- A) Encrypt, format, and reboot
- B) Copy, paste, and rename
- C) Observe, decide, and act
- D) Compile, print, and delete
**Answer:** C
**Explanation:** Agents perceive an environment and choose actions.

**AI-010** | Evaluation | Basic
Why test an AI system on representative cases?
- A) To avoid collecting requirements
- B) To make its code shorter
- C) To guarantee it can never fail
- D) To estimate how well it performs in its intended setting
**Answer:** D
**Explanation:** Representative evaluation reveals strengths and limitations.

**AI-011** | Responsible AI | Basic
What is a potential risk of biased training data?
- A) The system may produce unfair or uneven outcomes
- B) It guarantees explainability
- C) It always increases accuracy
- D) It removes the need for oversight
**Answer:** A
**Explanation:** Data patterns can lead to unequal performance across groups.

**AI-012** | Agents | Basic
A robot must avoid obstacles while reaching a target. What capability matters?
- A) Spreadsheet sorting
- B) Perception and action planning
- C) Email formatting
- D) CSS specificity
**Answer:** B
**Explanation:** The agent must sense its surroundings and choose safe actions.

**AI-013** | Search | Basic
When is depth-first search often memory-efficient?
- A) Only when there are no goals
- B) When every edge must be sorted
- C) When it follows one path deeply instead of storing an entire frontier
- D) When all nodes are stored twice
**Answer:** C
**Explanation:** DFS can use less frontier memory, though it may not find the shortest path.

**AI-014** | Knowledge Representation | Basic
What is an ontology commonly used to define?
- A) A user's browser zoom
- B) A CSS animation
- C) The speed of a GPU fan
- D) Concepts and relationships within a domain
**Answer:** D
**Explanation:** Ontologies describe domain concepts and their relationships.

**AI-015** | Responsible AI | Basic
Why should high-impact AI decisions allow human review?
- A) To support oversight, correction, and accountability
- B) To make the model impossible to test
- C) To hide all decisions
- D) To remove documentation
**Answer:** A
**Explanation:** Human oversight can catch errors and provide accountability.

**AI-016** | Fundamentals | Basic
What is the main goal of artificial intelligence?
- A) Make every program use the internet
- B) Build systems that perform tasks requiring intelligent behavior
- C) Replace all databases
- D) Increase monitor resolution
**Answer:** B
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-017** | Search | Basic
Which algorithm explores the shallowest unexpanded nodes first?
- A) Bubble sort
- B) Gradient descent
- C) Breadth-first search
- D) Depth-first search
**Answer:** C
**Explanation:** Breadth-first search explores level by level.

**AI-018** | Search | Basic
What is a heuristic in informed search?
- A) A programming language
- B) A database password
- C) A guaranteed final answer
- D) An estimate of the remaining cost to a goal
**Answer:** D
**Explanation:** A heuristic guides search using an estimate.

**AI-019** | Knowledge Representation | Basic
Why represent facts in a knowledge base?
- A) To support reasoning over stored information
- B) To compress every image
- C) To set page colors
- D) To replace all input validation
**Answer:** A
**Explanation:** Structured facts can be used by inference procedures.

**AI-020** | Reasoning | Basic
In a rule-based system, what does an IF-THEN rule express?
- A) A video format
- B) A condition and its resulting conclusion or action
- C) A network port
- D) A database backup
**Answer:** B
**Explanation:** Rules encode relationships used for inference.

**AI-021** | Planning | Basic
What is the purpose of an AI planning system?
- A) Only classify images
- B) Measure internet speed
- C) Find a sequence of actions to reach a goal
- D) Randomly change source code
**Answer:** C
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-022** | NLP | Basic
Which task is an example of natural language processing?
- A) Routing a network cable
- B) Measuring CPU temperature
- C) Resizing a screen
- D) Classifying the sentiment of a review
**Answer:** D
**Explanation:** Sentiment analysis processes human language.

**AI-023** | Computer Vision | Basic
Which task belongs to computer vision?
- A) Detecting objects in an image
- B) Summarizing a SQL index
- C) Encrypting a password
- D) Scheduling a meeting by hand
**Answer:** A
**Explanation:** Computer vision extracts information from images or video.

**AI-024** | Agents | Basic
What is an intelligent agent's typical cycle?
- A) Compile, print, and delete
- B) Observe, decide, and act
- C) Encrypt, format, and reboot
- D) Copy, paste, and rename
**Answer:** B
**Explanation:** Agents perceive an environment and choose actions.

**AI-025** | Evaluation | Basic
Why test an AI system on representative cases?
- A) To make its code shorter
- B) To guarantee it can never fail
- C) To estimate how well it performs in its intended setting
- D) To avoid collecting requirements
**Answer:** C
**Explanation:** Representative evaluation reveals strengths and limitations.

**AI-026** | Responsible AI | Basic
What is a potential risk of biased training data?
- A) It always increases accuracy
- B) It guarantees explainability
- C) It removes the need for oversight
- D) The system may produce unfair or uneven outcomes
**Answer:** D
**Explanation:** Data patterns can lead to unequal performance across groups.

**AI-027** | Agents | Basic
A robot must avoid obstacles while reaching a target. What capability matters?
- A) Perception and action planning
- B) Spreadsheet sorting
- C) Email formatting
- D) CSS specificity
**Answer:** A
**Explanation:** The agent must sense its surroundings and choose safe actions.

**AI-028** | Search | Basic
When is depth-first search often memory-efficient?
- A) When all nodes are stored twice
- B) When it follows one path deeply instead of storing an entire frontier
- C) Only when there are no goals
- D) When every edge must be sorted
**Answer:** B
**Explanation:** DFS can use less frontier memory, though it may not find the shortest path.

**AI-029** | Knowledge Representation | Basic
What is an ontology commonly used to define?
- A) The speed of a GPU fan
- B) A CSS animation
- C) Concepts and relationships within a domain
- D) A user's browser zoom
**Answer:** C
**Explanation:** Ontologies describe domain concepts and their relationships.

**AI-030** | Responsible AI | Basic
Why should high-impact AI decisions allow human review?
- A) To remove documentation
- B) To make the model impossible to test
- C) To hide all decisions
- D) To support oversight, correction, and accountability
**Answer:** D
**Explanation:** Human oversight can catch errors and provide accountability.

**AI-031** | Fundamentals | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the main goal of artificial intelligence?
- A) Build systems that perform tasks requiring intelligent behavior
- B) Replace all databases
- C) Increase monitor resolution
- D) Make every program use the internet
**Answer:** A
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-032** | Search | Medium
In a practical project, which statement is the most accurate?

Context: Which algorithm explores the shallowest unexpanded nodes first?
- A) Gradient descent
- B) Breadth-first search
- C) Depth-first search
- D) Bubble sort
**Answer:** B
**Explanation:** Breadth-first search explores level by level.

**AI-033** | Search | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a heuristic in informed search?
- A) A guaranteed final answer
- B) A programming language
- C) An estimate of the remaining cost to a goal
- D) A database password
**Answer:** C
**Explanation:** A heuristic guides search using an estimate.

**AI-034** | Knowledge Representation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why represent facts in a knowledge base?
- A) To replace all input validation
- B) To compress every image
- C) To set page colors
- D) To support reasoning over stored information
**Answer:** D
**Explanation:** Structured facts can be used by inference procedures.

**AI-035** | Reasoning | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: In a rule-based system, what does an IF-THEN rule express?
- A) A condition and its resulting conclusion or action
- B) A video format
- C) A database backup
- D) A network port
**Answer:** A
**Explanation:** Rules encode relationships used for inference.

**AI-036** | Planning | Medium
In a practical project, which statement is the most accurate?

Context: What is the purpose of an AI planning system?
- A) Randomly change source code
- B) Find a sequence of actions to reach a goal
- C) Measure internet speed
- D) Only classify images
**Answer:** B
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-037** | NLP | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which task is an example of natural language processing?
- A) Routing a network cable
- B) Measuring CPU temperature
- C) Classifying the sentiment of a review
- D) Resizing a screen
**Answer:** C
**Explanation:** Sentiment analysis processes human language.

**AI-038** | Computer Vision | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which task belongs to computer vision?
- A) Scheduling a meeting by hand
- B) Encrypting a password
- C) Summarizing a SQL index
- D) Detecting objects in an image
**Answer:** D
**Explanation:** Computer vision extracts information from images or video.

**AI-039** | Agents | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is an intelligent agent's typical cycle?
- A) Observe, decide, and act
- B) Copy, paste, and rename
- C) Encrypt, format, and reboot
- D) Compile, print, and delete
**Answer:** A
**Explanation:** Agents perceive an environment and choose actions.

**AI-040** | Evaluation | Medium
In a practical project, which statement is the most accurate?

Context: Why test an AI system on representative cases?
- A) To make its code shorter
- B) To estimate how well it performs in its intended setting
- C) To guarantee it can never fail
- D) To avoid collecting requirements
**Answer:** B
**Explanation:** Representative evaluation reveals strengths and limitations.

**AI-041** | Responsible AI | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a potential risk of biased training data?
- A) It guarantees explainability
- B) It removes the need for oversight
- C) The system may produce unfair or uneven outcomes
- D) It always increases accuracy
**Answer:** C
**Explanation:** Data patterns can lead to unequal performance across groups.

**AI-042** | Agents | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: A robot must avoid obstacles while reaching a target. What capability matters?
- A) CSS specificity
- B) Email formatting
- C) Spreadsheet sorting
- D) Perception and action planning
**Answer:** D
**Explanation:** The agent must sense its surroundings and choose safe actions.

**AI-043** | Search | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: When is depth-first search often memory-efficient?
- A) When it follows one path deeply instead of storing an entire frontier
- B) When all nodes are stored twice
- C) Only when there are no goals
- D) When every edge must be sorted
**Answer:** A
**Explanation:** DFS can use less frontier memory, though it may not find the shortest path.

**AI-044** | Knowledge Representation | Medium
In a practical project, which statement is the most accurate?

Context: What is an ontology commonly used to define?
- A) A user's browser zoom
- B) Concepts and relationships within a domain
- C) A CSS animation
- D) The speed of a GPU fan
**Answer:** B
**Explanation:** Ontologies describe domain concepts and their relationships.

**AI-045** | Responsible AI | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should high-impact AI decisions allow human review?
- A) To hide all decisions
- B) To make the model impossible to test
- C) To support oversight, correction, and accountability
- D) To remove documentation
**Answer:** C
**Explanation:** Human oversight can catch errors and provide accountability.

**AI-046** | Fundamentals | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the main goal of artificial intelligence?
- A) Replace all databases
- B) Increase monitor resolution
- C) Make every program use the internet
- D) Build systems that perform tasks requiring intelligent behavior
**Answer:** D
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-047** | Search | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which algorithm explores the shallowest unexpanded nodes first?
- A) Breadth-first search
- B) Depth-first search
- C) Bubble sort
- D) Gradient descent
**Answer:** A
**Explanation:** Breadth-first search explores level by level.

**AI-048** | Search | Medium
In a practical project, which statement is the most accurate?

Context: What is a heuristic in informed search?
- A) A database password
- B) An estimate of the remaining cost to a goal
- C) A guaranteed final answer
- D) A programming language
**Answer:** B
**Explanation:** A heuristic guides search using an estimate.

**AI-049** | Knowledge Representation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why represent facts in a knowledge base?
- A) To replace all input validation
- B) To set page colors
- C) To support reasoning over stored information
- D) To compress every image
**Answer:** C
**Explanation:** Structured facts can be used by inference procedures.

**AI-050** | Reasoning | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: In a rule-based system, what does an IF-THEN rule express?
- A) A video format
- B) A network port
- C) A database backup
- D) A condition and its resulting conclusion or action
**Answer:** D
**Explanation:** Rules encode relationships used for inference.

**AI-051** | Planning | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the purpose of an AI planning system?
- A) Find a sequence of actions to reach a goal
- B) Only classify images
- C) Measure internet speed
- D) Randomly change source code
**Answer:** A
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-052** | NLP | Medium
In a practical project, which statement is the most accurate?

Context: Which task is an example of natural language processing?
- A) Measuring CPU temperature
- B) Classifying the sentiment of a review
- C) Routing a network cable
- D) Resizing a screen
**Answer:** B
**Explanation:** Sentiment analysis processes human language.

**AI-053** | Computer Vision | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which task belongs to computer vision?
- A) Encrypting a password
- B) Scheduling a meeting by hand
- C) Detecting objects in an image
- D) Summarizing a SQL index
**Answer:** C
**Explanation:** Computer vision extracts information from images or video.

**AI-054** | Agents | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is an intelligent agent's typical cycle?
- A) Encrypt, format, and reboot
- B) Copy, paste, and rename
- C) Compile, print, and delete
- D) Observe, decide, and act
**Answer:** D
**Explanation:** Agents perceive an environment and choose actions.

**AI-055** | Evaluation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why test an AI system on representative cases?
- A) To estimate how well it performs in its intended setting
- B) To guarantee it can never fail
- C) To make its code shorter
- D) To avoid collecting requirements
**Answer:** A
**Explanation:** Representative evaluation reveals strengths and limitations.

**AI-056** | Responsible AI | Medium
In a practical project, which statement is the most accurate?

Context: What is a potential risk of biased training data?
- A) It guarantees explainability
- B) The system may produce unfair or uneven outcomes
- C) It removes the need for oversight
- D) It always increases accuracy
**Answer:** B
**Explanation:** Data patterns can lead to unequal performance across groups.

**AI-057** | Agents | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A robot must avoid obstacles while reaching a target. What capability matters?
- A) CSS specificity
- B) Spreadsheet sorting
- C) Perception and action planning
- D) Email formatting
**Answer:** C
**Explanation:** The agent must sense its surroundings and choose safe actions.

**AI-058** | Search | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: When is depth-first search often memory-efficient?
- A) Only when there are no goals
- B) When all nodes are stored twice
- C) When every edge must be sorted
- D) When it follows one path deeply instead of storing an entire frontier
**Answer:** D
**Explanation:** DFS can use less frontier memory, though it may not find the shortest path.

**AI-059** | Knowledge Representation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is an ontology commonly used to define?
- A) Concepts and relationships within a domain
- B) A user's browser zoom
- C) The speed of a GPU fan
- D) A CSS animation
**Answer:** A
**Explanation:** Ontologies describe domain concepts and their relationships.

**AI-060** | Responsible AI | Medium
In a practical project, which statement is the most accurate?

Context: Why should high-impact AI decisions allow human review?
- A) To remove documentation
- B) To support oversight, correction, and accountability
- C) To make the model impossible to test
- D) To hide all decisions
**Answer:** B
**Explanation:** Human oversight can catch errors and provide accountability.

**AI-061** | Fundamentals | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the main goal of artificial intelligence?
- A) Replace all databases
- B) Increase monitor resolution
- C) Build systems that perform tasks requiring intelligent behavior
- D) Make every program use the internet
**Answer:** C
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-062** | Search | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which algorithm explores the shallowest unexpanded nodes first?
- A) Gradient descent
- B) Bubble sort
- C) Depth-first search
- D) Breadth-first search
**Answer:** D
**Explanation:** Breadth-first search explores level by level.

**AI-063** | Search | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a heuristic in informed search?
- A) An estimate of the remaining cost to a goal
- B) A programming language
- C) A guaranteed final answer
- D) A database password
**Answer:** A
**Explanation:** A heuristic guides search using an estimate.

**AI-064** | Knowledge Representation | Medium
In a practical project, which statement is the most accurate?

Context: Why represent facts in a knowledge base?
- A) To replace all input validation
- B) To support reasoning over stored information
- C) To compress every image
- D) To set page colors
**Answer:** B
**Explanation:** Structured facts can be used by inference procedures.

**AI-065** | Reasoning | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: In a rule-based system, what does an IF-THEN rule express?
- A) A network port
- B) A video format
- C) A condition and its resulting conclusion or action
- D) A database backup
**Answer:** C
**Explanation:** Rules encode relationships used for inference.

**AI-066** | Planning | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the purpose of an AI planning system?
- A) Measure internet speed
- B) Only classify images
- C) Randomly change source code
- D) Find a sequence of actions to reach a goal
**Answer:** D
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-067** | NLP | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which task is an example of natural language processing?
- A) Classifying the sentiment of a review
- B) Routing a network cable
- C) Resizing a screen
- D) Measuring CPU temperature
**Answer:** A
**Explanation:** Sentiment analysis processes human language.

**AI-068** | Computer Vision | Medium
In a practical project, which statement is the most accurate?

Context: Which task belongs to computer vision?
- A) Encrypting a password
- B) Detecting objects in an image
- C) Scheduling a meeting by hand
- D) Summarizing a SQL index
**Answer:** B
**Explanation:** Computer vision extracts information from images or video.

**AI-069** | Agents | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is an intelligent agent's typical cycle?
- A) Copy, paste, and rename
- B) Encrypt, format, and reboot
- C) Observe, decide, and act
- D) Compile, print, and delete
**Answer:** C
**Explanation:** Agents perceive an environment and choose actions.

**AI-070** | Evaluation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why test an AI system on representative cases?
- A) To make its code shorter
- B) To guarantee it can never fail
- C) To avoid collecting requirements
- D) To estimate how well it performs in its intended setting
**Answer:** D
**Explanation:** Representative evaluation reveals strengths and limitations.

**AI-071** | Responsible AI | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a potential risk of biased training data?
- A) The system may produce unfair or uneven outcomes
- B) It always increases accuracy
- C) It guarantees explainability
- D) It removes the need for oversight
**Answer:** A
**Explanation:** Data patterns can lead to unequal performance across groups.

**AI-072** | Agents | Medium
In a practical project, which statement is the most accurate?

Context: A robot must avoid obstacles while reaching a target. What capability matters?
- A) Spreadsheet sorting
- B) Perception and action planning
- C) CSS specificity
- D) Email formatting
**Answer:** B
**Explanation:** The agent must sense its surroundings and choose safe actions.

**AI-073** | Search | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: When is depth-first search often memory-efficient?
- A) Only when there are no goals
- B) When every edge must be sorted
- C) When it follows one path deeply instead of storing an entire frontier
- D) When all nodes are stored twice
**Answer:** C
**Explanation:** DFS can use less frontier memory, though it may not find the shortest path.

**AI-074** | Knowledge Representation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is an ontology commonly used to define?
- A) A CSS animation
- B) A user's browser zoom
- C) The speed of a GPU fan
- D) Concepts and relationships within a domain
**Answer:** D
**Explanation:** Ontologies describe domain concepts and their relationships.

**AI-075** | Responsible AI | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should high-impact AI decisions allow human review?
- A) To support oversight, correction, and accountability
- B) To hide all decisions
- C) To make the model impossible to test
- D) To remove documentation
**Answer:** A
**Explanation:** Human oversight can catch errors and provide accountability.

**AI-076** | Fundamentals | Medium
In a practical project, which statement is the most accurate?

Context: What is the main goal of artificial intelligence?
- A) Make every program use the internet
- B) Build systems that perform tasks requiring intelligent behavior
- C) Increase monitor resolution
- D) Replace all databases
**Answer:** B
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-077** | Search | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which algorithm explores the shallowest unexpanded nodes first?
- A) Bubble sort
- B) Gradient descent
- C) Breadth-first search
- D) Depth-first search
**Answer:** C
**Explanation:** Breadth-first search explores level by level.

**AI-078** | Search | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a heuristic in informed search?
- A) A database password
- B) A programming language
- C) A guaranteed final answer
- D) An estimate of the remaining cost to a goal
**Answer:** D
**Explanation:** A heuristic guides search using an estimate.

**AI-079** | Knowledge Representation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why represent facts in a knowledge base?
- A) To support reasoning over stored information
- B) To replace all input validation
- C) To set page colors
- D) To compress every image
**Answer:** A
**Explanation:** Structured facts can be used by inference procedures.

**AI-080** | Reasoning | Medium
In a practical project, which statement is the most accurate?

Context: In a rule-based system, what does an IF-THEN rule express?
- A) A database backup
- B) A condition and its resulting conclusion or action
- C) A network port
- D) A video format
**Answer:** B
**Explanation:** Rules encode relationships used for inference.

**AI-081** | Planning | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the purpose of an AI planning system?
- A) Only classify images
- B) Measure internet speed
- C) Find a sequence of actions to reach a goal
- D) Randomly change source code
**Answer:** C
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-082** | NLP | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which task is an example of natural language processing?
- A) Routing a network cable
- B) Measuring CPU temperature
- C) Resizing a screen
- D) Classifying the sentiment of a review
**Answer:** D
**Explanation:** Sentiment analysis processes human language.

**AI-083** | Computer Vision | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which task belongs to computer vision?
- A) Detecting objects in an image
- B) Scheduling a meeting by hand
- C) Encrypting a password
- D) Summarizing a SQL index
**Answer:** A
**Explanation:** Computer vision extracts information from images or video.

**AI-084** | Agents | Medium
In a practical project, which statement is the most accurate?

Context: What is an intelligent agent's typical cycle?
- A) Encrypt, format, and reboot
- B) Observe, decide, and act
- C) Copy, paste, and rename
- D) Compile, print, and delete
**Answer:** B
**Explanation:** Agents perceive an environment and choose actions.

**AI-085** | Evaluation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why test an AI system on representative cases?
- A) To make its code shorter
- B) To avoid collecting requirements
- C) To estimate how well it performs in its intended setting
- D) To guarantee it can never fail
**Answer:** C
**Explanation:** Representative evaluation reveals strengths and limitations.

**AI-086** | Responsible AI | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a potential risk of biased training data?
- A) It removes the need for oversight
- B) It always increases accuracy
- C) It guarantees explainability
- D) The system may produce unfair or uneven outcomes
**Answer:** D
**Explanation:** Data patterns can lead to unequal performance across groups.

**AI-087** | Agents | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A robot must avoid obstacles while reaching a target. What capability matters?
- A) Perception and action planning
- B) Spreadsheet sorting
- C) CSS specificity
- D) Email formatting
**Answer:** A
**Explanation:** The agent must sense its surroundings and choose safe actions.

**AI-088** | Search | Medium
In a practical project, which statement is the most accurate?

Context: When is depth-first search often memory-efficient?
- A) When all nodes are stored twice
- B) When it follows one path deeply instead of storing an entire frontier
- C) Only when there are no goals
- D) When every edge must be sorted
**Answer:** B
**Explanation:** DFS can use less frontier memory, though it may not find the shortest path.

**AI-089** | Knowledge Representation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is an ontology commonly used to define?
- A) The speed of a GPU fan
- B) A user's browser zoom
- C) Concepts and relationships within a domain
- D) A CSS animation
**Answer:** C
**Explanation:** Ontologies describe domain concepts and their relationships.

**AI-090** | Responsible AI | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why should high-impact AI decisions allow human review?
- A) To make the model impossible to test
- B) To remove documentation
- C) To hide all decisions
- D) To support oversight, correction, and accountability
**Answer:** D
**Explanation:** Human oversight can catch errors and provide accountability.

**AI-091** | Fundamentals | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the main goal of artificial intelligence?
- A) Build systems that perform tasks requiring intelligent behavior
- B) Replace all databases
- C) Increase monitor resolution
- D) Make every program use the internet
**Answer:** A
**Explanation:** AI focuses on tasks such as reasoning, perception, planning, and language.

**AI-092** | Search | Medium
In a practical project, which statement is the most accurate?

Context: Which algorithm explores the shallowest unexpanded nodes first?
- A) Gradient descent
- B) Breadth-first search
- C) Depth-first search
- D) Bubble sort
**Answer:** B
**Explanation:** Breadth-first search explores level by level.

**AI-093** | Search | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a heuristic in informed search?
- A) A programming language
- B) A guaranteed final answer
- C) An estimate of the remaining cost to a goal
- D) A database password
**Answer:** C
**Explanation:** A heuristic guides search using an estimate.

**AI-094** | Knowledge Representation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why represent facts in a knowledge base?
- A) To compress every image
- B) To set page colors
- C) To replace all input validation
- D) To support reasoning over stored information
**Answer:** D
**Explanation:** Structured facts can be used by inference procedures.

**AI-095** | Reasoning | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: In a rule-based system, what does an IF-THEN rule express?
- A) A condition and its resulting conclusion or action
- B) A network port
- C) A video format
- D) A database backup
**Answer:** A
**Explanation:** Rules encode relationships used for inference.

**AI-096** | Planning | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What is the purpose of an AI planning system?
- A) Only classify images
- B) Find a sequence of actions to reach a goal
- C) Measure internet speed
- D) Randomly change source code
**Answer:** B
**Explanation:** Planning searches for actions that satisfy a goal and constraints.

**AI-097** | NLP | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: Which task is an example of natural language processing?
- A) Routing a network cable
- B) Resizing a screen
- C) Classifying the sentiment of a review
- D) Measuring CPU temperature
**Answer:** C
**Explanation:** Sentiment analysis processes human language.

**AI-098** | Computer Vision | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: Which task belongs to computer vision?
- A) Encrypting a password
- B) Scheduling a meeting by hand
- C) Summarizing a SQL index
- D) Detecting objects in an image
**Answer:** D
**Explanation:** Computer vision extracts information from images or video.

**AI-099** | Agents | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: What is an intelligent agent's typical cycle?
- A) Observe, decide, and act
- B) Encrypt, format, and reboot
- C) Compile, print, and delete
- D) Copy, paste, and rename
**Answer:** A
**Explanation:** Agents perceive an environment and choose actions.

**AI-100** | Evaluation | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Why test an AI system on representative cases?
- A) To avoid collecting requirements
- B) To estimate how well it performs in its intended setting
- C) To guarantee it can never fail
- D) To make its code shorter
**Answer:** B
**Explanation:** Representative evaluation reveals strengths and limitations.


# ML — AI and ML

**ML-001** | Learning Types | Basic
Which is a supervised learning example?
- A) Compressing an image without labels
- B) Predicting house prices from labeled historical examples
- C) Grouping unlabeled customers
- D) Randomly assigning categories
**Answer:** B
**Explanation:** Supervised learning uses examples with target labels.

**ML-002** | Learning Types | Basic
Which task is usually unsupervised?
- A) Estimating a labeled price
- B) Detecting a known target from labeled data
- C) Grouping customers by similarity without known labels
- D) Predicting labeled exam scores
**Answer:** C
**Explanation:** Clustering can find structure in unlabeled data.

**ML-003** | Data Preparation | Basic
Why handle missing values before training?
- A) Missing values always improve accuracy
- B) It removes the need for testing
- C) It guarantees fairness
- D) Many algorithms cannot directly use missing values reliably
**Answer:** D
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-004** | Features | Basic
What is a feature in machine learning?
- A) An input variable used by a model
- B) A random output label
- C) A server password
- D) The final model score only
**Answer:** A
**Explanation:** Features describe examples for the model.

**ML-005** | Regression | Basic
Which task is regression?
- A) Grouping documents by similarity
- B) Predicting tomorrow's temperature as a numeric value
- C) Assigning an image folder name manually
- D) Classifying an email as spam or not spam
**Answer:** B
**Explanation:** Regression predicts numeric targets.

**ML-006** | Classification | Basic
Which task is classification?
- A) Predicting a home's exact price
- B) Reducing image file size
- C) Predicting whether a transaction is fraudulent
- D) Sorting rows alphabetically only
**Answer:** C
**Explanation:** Classification predicts discrete classes.

**ML-007** | Evaluation | Basic
Why can accuracy be misleading on imbalanced data?
- A) Accuracy is always zero for small data
- B) Accuracy measures training time
- C) It cannot be calculated from predictions
- D) A model may predict the majority class and still score highly
**Answer:** D
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-008** | Overfitting | Basic
A model scores 99% on training data but 60% on test data. What is likely?
- A) Overfitting
- B) No training occurred
- C) Perfect generalization
- D) The test set was used as a feature
**Answer:** A
**Explanation:** A large train-test gap suggests poor generalization.

**ML-009** | Validation | Basic
Why keep a test set separate until final evaluation?
- A) To duplicate every row
- B) To estimate performance on unseen data without tuning to it
- C) To make training take longer
- D) To avoid measuring performance
**Answer:** B
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-010** | Clustering | Basic
What does k-means attempt to do?
- A) Predict only text sentiment
- B) Sort records by date
- C) Group points into k clusters around centroids
- D) Encrypt numeric columns
**Answer:** C
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.

**ML-011** | Deployment | Basic
What is model drift?
- A) A model file being renamed
- B) A monitor changing brightness
- C) A database table being indexed
- D) A change in data patterns that can degrade model performance
**Answer:** D
**Explanation:** Changing inputs or relationships can reduce production accuracy.

**ML-012** | Data Preparation | Basic
Why fit a scaler only on training data before transforming test data?
- A) To prevent information from the test set leaking into preprocessing
- B) To avoid using a model
- C) To ensure all features become categories
- D) To increase the number of labels
**Answer:** A
**Explanation:** Preprocessing fitted on test data can leak information into training.

**ML-013** | Features | Basic
What is data leakage?
- A) Splitting data into batches
- B) Using information unavailable at prediction time or leaking target-related information
- C) Deleting duplicate files only
- D) Compressing features
**Answer:** B
**Explanation:** Leakage makes evaluation appear better than real-world performance.

**ML-014** | Evaluation | Basic
For rare fraud cases, which pair is especially useful to inspect?
- A) File size and font
- B) Rows and columns only
- C) Precision and recall
- D) Screen size and CPU clock
**Answer:** C
**Explanation:** Precision and recall reveal different costs of false positives and false negatives.

**ML-015** | Validation | Basic
What is cross-validation commonly used for?
- A) Encrypting labels
- B) Replacing all data cleaning
- C) Guaranteeing perfect results
- D) Assessing model stability across multiple data splits
**Answer:** D
**Explanation:** Cross-validation evaluates performance across several folds.

**ML-016** | Learning Types | Basic
Which is a supervised learning example?
- A) Predicting house prices from labeled historical examples
- B) Compressing an image without labels
- C) Grouping unlabeled customers
- D) Randomly assigning categories
**Answer:** A
**Explanation:** Supervised learning uses examples with target labels.

**ML-017** | Learning Types | Basic
Which task is usually unsupervised?
- A) Predicting labeled exam scores
- B) Grouping customers by similarity without known labels
- C) Estimating a labeled price
- D) Detecting a known target from labeled data
**Answer:** B
**Explanation:** Clustering can find structure in unlabeled data.

**ML-018** | Data Preparation | Basic
Why handle missing values before training?
- A) It removes the need for testing
- B) Missing values always improve accuracy
- C) Many algorithms cannot directly use missing values reliably
- D) It guarantees fairness
**Answer:** C
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-019** | Features | Basic
What is a feature in machine learning?
- A) A random output label
- B) A server password
- C) The final model score only
- D) An input variable used by a model
**Answer:** D
**Explanation:** Features describe examples for the model.

**ML-020** | Regression | Basic
Which task is regression?
- A) Predicting tomorrow's temperature as a numeric value
- B) Assigning an image folder name manually
- C) Classifying an email as spam or not spam
- D) Grouping documents by similarity
**Answer:** A
**Explanation:** Regression predicts numeric targets.

**ML-021** | Classification | Basic
Which task is classification?
- A) Predicting a home's exact price
- B) Predicting whether a transaction is fraudulent
- C) Sorting rows alphabetically only
- D) Reducing image file size
**Answer:** B
**Explanation:** Classification predicts discrete classes.

**ML-022** | Evaluation | Basic
Why can accuracy be misleading on imbalanced data?
- A) Accuracy is always zero for small data
- B) Accuracy measures training time
- C) A model may predict the majority class and still score highly
- D) It cannot be calculated from predictions
**Answer:** C
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-023** | Overfitting | Basic
A model scores 99% on training data but 60% on test data. What is likely?
- A) No training occurred
- B) The test set was used as a feature
- C) Perfect generalization
- D) Overfitting
**Answer:** D
**Explanation:** A large train-test gap suggests poor generalization.

**ML-024** | Validation | Basic
Why keep a test set separate until final evaluation?
- A) To estimate performance on unseen data without tuning to it
- B) To duplicate every row
- C) To avoid measuring performance
- D) To make training take longer
**Answer:** A
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-025** | Clustering | Basic
What does k-means attempt to do?
- A) Predict only text sentiment
- B) Group points into k clusters around centroids
- C) Encrypt numeric columns
- D) Sort records by date
**Answer:** B
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.

**ML-026** | Deployment | Basic
What is model drift?
- A) A model file being renamed
- B) A monitor changing brightness
- C) A change in data patterns that can degrade model performance
- D) A database table being indexed
**Answer:** C
**Explanation:** Changing inputs or relationships can reduce production accuracy.

**ML-027** | Data Preparation | Basic
Why fit a scaler only on training data before transforming test data?
- A) To avoid using a model
- B) To ensure all features become categories
- C) To increase the number of labels
- D) To prevent information from the test set leaking into preprocessing
**Answer:** D
**Explanation:** Preprocessing fitted on test data can leak information into training.

**ML-028** | Features | Basic
What is data leakage?
- A) Using information unavailable at prediction time or leaking target-related information
- B) Deleting duplicate files only
- C) Splitting data into batches
- D) Compressing features
**Answer:** A
**Explanation:** Leakage makes evaluation appear better than real-world performance.

**ML-029** | Evaluation | Basic
For rare fraud cases, which pair is especially useful to inspect?
- A) Rows and columns only
- B) Precision and recall
- C) File size and font
- D) Screen size and CPU clock
**Answer:** B
**Explanation:** Precision and recall reveal different costs of false positives and false negatives.

**ML-030** | Validation | Basic
What is cross-validation commonly used for?
- A) Replacing all data cleaning
- B) Encrypting labels
- C) Assessing model stability across multiple data splits
- D) Guaranteeing perfect results
**Answer:** C
**Explanation:** Cross-validation evaluates performance across several folds.

**ML-031** | Learning Types | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which is a supervised learning example?
- A) Randomly assigning categories
- B) Compressing an image without labels
- C) Grouping unlabeled customers
- D) Predicting house prices from labeled historical examples
**Answer:** D
**Explanation:** Supervised learning uses examples with target labels.

**ML-032** | Learning Types | Medium
In a practical project, which statement is the most accurate?

Context: Which task is usually unsupervised?
- A) Grouping customers by similarity without known labels
- B) Detecting a known target from labeled data
- C) Estimating a labeled price
- D) Predicting labeled exam scores
**Answer:** A
**Explanation:** Clustering can find structure in unlabeled data.

**ML-033** | Data Preparation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why handle missing values before training?
- A) Missing values always improve accuracy
- B) Many algorithms cannot directly use missing values reliably
- C) It removes the need for testing
- D) It guarantees fairness
**Answer:** B
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-034** | Features | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a feature in machine learning?
- A) A server password
- B) A random output label
- C) An input variable used by a model
- D) The final model score only
**Answer:** C
**Explanation:** Features describe examples for the model.

**ML-035** | Regression | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which task is regression?
- A) Grouping documents by similarity
- B) Classifying an email as spam or not spam
- C) Assigning an image folder name manually
- D) Predicting tomorrow's temperature as a numeric value
**Answer:** D
**Explanation:** Regression predicts numeric targets.

**ML-036** | Classification | Medium
In a practical project, which statement is the most accurate?

Context: Which task is classification?
- A) Predicting whether a transaction is fraudulent
- B) Reducing image file size
- C) Predicting a home's exact price
- D) Sorting rows alphabetically only
**Answer:** A
**Explanation:** Classification predicts discrete classes.

**ML-037** | Evaluation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why can accuracy be misleading on imbalanced data?
- A) Accuracy measures training time
- B) A model may predict the majority class and still score highly
- C) It cannot be calculated from predictions
- D) Accuracy is always zero for small data
**Answer:** B
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-038** | Overfitting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: A model scores 99% on training data but 60% on test data. What is likely?
- A) Perfect generalization
- B) The test set was used as a feature
- C) Overfitting
- D) No training occurred
**Answer:** C
**Explanation:** A large train-test gap suggests poor generalization.

**ML-039** | Validation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why keep a test set separate until final evaluation?
- A) To avoid measuring performance
- B) To duplicate every row
- C) To make training take longer
- D) To estimate performance on unseen data without tuning to it
**Answer:** D
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-040** | Clustering | Medium
In a practical project, which statement is the most accurate?

Context: What does k-means attempt to do?
- A) Group points into k clusters around centroids
- B) Predict only text sentiment
- C) Encrypt numeric columns
- D) Sort records by date
**Answer:** A
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.

**ML-041** | Deployment | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is model drift?
- A) A database table being indexed
- B) A change in data patterns that can degrade model performance
- C) A model file being renamed
- D) A monitor changing brightness
**Answer:** B
**Explanation:** Changing inputs or relationships can reduce production accuracy.

**ML-042** | Data Preparation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why fit a scaler only on training data before transforming test data?
- A) To ensure all features become categories
- B) To avoid using a model
- C) To prevent information from the test set leaking into preprocessing
- D) To increase the number of labels
**Answer:** C
**Explanation:** Preprocessing fitted on test data can leak information into training.

**ML-043** | Features | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is data leakage?
- A) Deleting duplicate files only
- B) Compressing features
- C) Splitting data into batches
- D) Using information unavailable at prediction time or leaking target-related information
**Answer:** D
**Explanation:** Leakage makes evaluation appear better than real-world performance.

**ML-044** | Evaluation | Medium
In a practical project, which statement is the most accurate?

Context: For rare fraud cases, which pair is especially useful to inspect?
- A) Precision and recall
- B) Rows and columns only
- C) Screen size and CPU clock
- D) File size and font
**Answer:** A
**Explanation:** Precision and recall reveal different costs of false positives and false negatives.

**ML-045** | Validation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is cross-validation commonly used for?
- A) Guaranteeing perfect results
- B) Assessing model stability across multiple data splits
- C) Replacing all data cleaning
- D) Encrypting labels
**Answer:** B
**Explanation:** Cross-validation evaluates performance across several folds.

**ML-046** | Learning Types | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which is a supervised learning example?
- A) Grouping unlabeled customers
- B) Randomly assigning categories
- C) Predicting house prices from labeled historical examples
- D) Compressing an image without labels
**Answer:** C
**Explanation:** Supervised learning uses examples with target labels.

**ML-047** | Learning Types | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which task is usually unsupervised?
- A) Estimating a labeled price
- B) Predicting labeled exam scores
- C) Detecting a known target from labeled data
- D) Grouping customers by similarity without known labels
**Answer:** D
**Explanation:** Clustering can find structure in unlabeled data.

**ML-048** | Data Preparation | Medium
In a practical project, which statement is the most accurate?

Context: Why handle missing values before training?
- A) Many algorithms cannot directly use missing values reliably
- B) It guarantees fairness
- C) Missing values always improve accuracy
- D) It removes the need for testing
**Answer:** A
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-049** | Features | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a feature in machine learning?
- A) The final model score only
- B) An input variable used by a model
- C) A server password
- D) A random output label
**Answer:** B
**Explanation:** Features describe examples for the model.

**ML-050** | Regression | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which task is regression?
- A) Grouping documents by similarity
- B) Assigning an image folder name manually
- C) Predicting tomorrow's temperature as a numeric value
- D) Classifying an email as spam or not spam
**Answer:** C
**Explanation:** Regression predicts numeric targets.

**ML-051** | Classification | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which task is classification?
- A) Predicting a home's exact price
- B) Reducing image file size
- C) Sorting rows alphabetically only
- D) Predicting whether a transaction is fraudulent
**Answer:** D
**Explanation:** Classification predicts discrete classes.

**ML-052** | Evaluation | Medium
In a practical project, which statement is the most accurate?

Context: Why can accuracy be misleading on imbalanced data?
- A) A model may predict the majority class and still score highly
- B) It cannot be calculated from predictions
- C) Accuracy measures training time
- D) Accuracy is always zero for small data
**Answer:** A
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-053** | Overfitting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A model scores 99% on training data but 60% on test data. What is likely?
- A) Perfect generalization
- B) Overfitting
- C) No training occurred
- D) The test set was used as a feature
**Answer:** B
**Explanation:** A large train-test gap suggests poor generalization.

**ML-054** | Validation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why keep a test set separate until final evaluation?
- A) To avoid measuring performance
- B) To make training take longer
- C) To estimate performance on unseen data without tuning to it
- D) To duplicate every row
**Answer:** C
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-055** | Clustering | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does k-means attempt to do?
- A) Predict only text sentiment
- B) Sort records by date
- C) Encrypt numeric columns
- D) Group points into k clusters around centroids
**Answer:** D
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.

**ML-056** | Deployment | Medium
In a practical project, which statement is the most accurate?

Context: What is model drift?
- A) A change in data patterns that can degrade model performance
- B) A model file being renamed
- C) A database table being indexed
- D) A monitor changing brightness
**Answer:** A
**Explanation:** Changing inputs or relationships can reduce production accuracy.

**ML-057** | Data Preparation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why fit a scaler only on training data before transforming test data?
- A) To avoid using a model
- B) To prevent information from the test set leaking into preprocessing
- C) To increase the number of labels
- D) To ensure all features become categories
**Answer:** B
**Explanation:** Preprocessing fitted on test data can leak information into training.

**ML-058** | Features | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is data leakage?
- A) Compressing features
- B) Deleting duplicate files only
- C) Using information unavailable at prediction time or leaking target-related information
- D) Splitting data into batches
**Answer:** C
**Explanation:** Leakage makes evaluation appear better than real-world performance.

**ML-059** | Evaluation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: For rare fraud cases, which pair is especially useful to inspect?
- A) File size and font
- B) Rows and columns only
- C) Screen size and CPU clock
- D) Precision and recall
**Answer:** D
**Explanation:** Precision and recall reveal different costs of false positives and false negatives.

**ML-060** | Validation | Medium
In a practical project, which statement is the most accurate?

Context: What is cross-validation commonly used for?
- A) Assessing model stability across multiple data splits
- B) Guaranteeing perfect results
- C) Replacing all data cleaning
- D) Encrypting labels
**Answer:** A
**Explanation:** Cross-validation evaluates performance across several folds.

**ML-061** | Learning Types | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which is a supervised learning example?
- A) Randomly assigning categories
- B) Predicting house prices from labeled historical examples
- C) Compressing an image without labels
- D) Grouping unlabeled customers
**Answer:** B
**Explanation:** Supervised learning uses examples with target labels.

**ML-062** | Learning Types | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which task is usually unsupervised?
- A) Estimating a labeled price
- B) Predicting labeled exam scores
- C) Grouping customers by similarity without known labels
- D) Detecting a known target from labeled data
**Answer:** C
**Explanation:** Clustering can find structure in unlabeled data.

**ML-063** | Data Preparation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why handle missing values before training?
- A) Missing values always improve accuracy
- B) It guarantees fairness
- C) It removes the need for testing
- D) Many algorithms cannot directly use missing values reliably
**Answer:** D
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-064** | Features | Medium
In a practical project, which statement is the most accurate?

Context: What is a feature in machine learning?
- A) An input variable used by a model
- B) A random output label
- C) A server password
- D) The final model score only
**Answer:** A
**Explanation:** Features describe examples for the model.

**ML-065** | Regression | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which task is regression?
- A) Classifying an email as spam or not spam
- B) Predicting tomorrow's temperature as a numeric value
- C) Grouping documents by similarity
- D) Assigning an image folder name manually
**Answer:** B
**Explanation:** Regression predicts numeric targets.

**ML-066** | Classification | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which task is classification?
- A) Reducing image file size
- B) Predicting a home's exact price
- C) Predicting whether a transaction is fraudulent
- D) Sorting rows alphabetically only
**Answer:** C
**Explanation:** Classification predicts discrete classes.

**ML-067** | Evaluation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why can accuracy be misleading on imbalanced data?
- A) It cannot be calculated from predictions
- B) Accuracy measures training time
- C) Accuracy is always zero for small data
- D) A model may predict the majority class and still score highly
**Answer:** D
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-068** | Overfitting | Medium
In a practical project, which statement is the most accurate?

Context: A model scores 99% on training data but 60% on test data. What is likely?
- A) Overfitting
- B) No training occurred
- C) Perfect generalization
- D) The test set was used as a feature
**Answer:** A
**Explanation:** A large train-test gap suggests poor generalization.

**ML-069** | Validation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why keep a test set separate until final evaluation?
- A) To avoid measuring performance
- B) To estimate performance on unseen data without tuning to it
- C) To duplicate every row
- D) To make training take longer
**Answer:** B
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-070** | Clustering | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does k-means attempt to do?
- A) Sort records by date
- B) Encrypt numeric columns
- C) Group points into k clusters around centroids
- D) Predict only text sentiment
**Answer:** C
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.

**ML-071** | Deployment | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is model drift?
- A) A model file being renamed
- B) A monitor changing brightness
- C) A database table being indexed
- D) A change in data patterns that can degrade model performance
**Answer:** D
**Explanation:** Changing inputs or relationships can reduce production accuracy.

**ML-072** | Data Preparation | Medium
In a practical project, which statement is the most accurate?

Context: Why fit a scaler only on training data before transforming test data?
- A) To prevent information from the test set leaking into preprocessing
- B) To increase the number of labels
- C) To avoid using a model
- D) To ensure all features become categories
**Answer:** A
**Explanation:** Preprocessing fitted on test data can leak information into training.

**ML-073** | Features | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is data leakage?
- A) Deleting duplicate files only
- B) Using information unavailable at prediction time or leaking target-related information
- C) Splitting data into batches
- D) Compressing features
**Answer:** B
**Explanation:** Leakage makes evaluation appear better than real-world performance.

**ML-074** | Evaluation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: For rare fraud cases, which pair is especially useful to inspect?
- A) Rows and columns only
- B) Screen size and CPU clock
- C) Precision and recall
- D) File size and font
**Answer:** C
**Explanation:** Precision and recall reveal different costs of false positives and false negatives.

**ML-075** | Validation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is cross-validation commonly used for?
- A) Guaranteeing perfect results
- B) Encrypting labels
- C) Replacing all data cleaning
- D) Assessing model stability across multiple data splits
**Answer:** D
**Explanation:** Cross-validation evaluates performance across several folds.

**ML-076** | Learning Types | Medium
In a practical project, which statement is the most accurate?

Context: Which is a supervised learning example?
- A) Predicting house prices from labeled historical examples
- B) Grouping unlabeled customers
- C) Compressing an image without labels
- D) Randomly assigning categories
**Answer:** A
**Explanation:** Supervised learning uses examples with target labels.

**ML-077** | Learning Types | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which task is usually unsupervised?
- A) Predicting labeled exam scores
- B) Grouping customers by similarity without known labels
- C) Detecting a known target from labeled data
- D) Estimating a labeled price
**Answer:** B
**Explanation:** Clustering can find structure in unlabeled data.

**ML-078** | Data Preparation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why handle missing values before training?
- A) It removes the need for testing
- B) It guarantees fairness
- C) Many algorithms cannot directly use missing values reliably
- D) Missing values always improve accuracy
**Answer:** C
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-079** | Features | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a feature in machine learning?
- A) A server password
- B) A random output label
- C) The final model score only
- D) An input variable used by a model
**Answer:** D
**Explanation:** Features describe examples for the model.

**ML-080** | Regression | Medium
In a practical project, which statement is the most accurate?

Context: Which task is regression?
- A) Predicting tomorrow's temperature as a numeric value
- B) Assigning an image folder name manually
- C) Grouping documents by similarity
- D) Classifying an email as spam or not spam
**Answer:** A
**Explanation:** Regression predicts numeric targets.

**ML-081** | Classification | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which task is classification?
- A) Sorting rows alphabetically only
- B) Predicting whether a transaction is fraudulent
- C) Reducing image file size
- D) Predicting a home's exact price
**Answer:** B
**Explanation:** Classification predicts discrete classes.

**ML-082** | Evaluation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why can accuracy be misleading on imbalanced data?
- A) Accuracy is always zero for small data
- B) It cannot be calculated from predictions
- C) A model may predict the majority class and still score highly
- D) Accuracy measures training time
**Answer:** C
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-083** | Overfitting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A model scores 99% on training data but 60% on test data. What is likely?
- A) Perfect generalization
- B) The test set was used as a feature
- C) No training occurred
- D) Overfitting
**Answer:** D
**Explanation:** A large train-test gap suggests poor generalization.

**ML-084** | Validation | Medium
In a practical project, which statement is the most accurate?

Context: Why keep a test set separate until final evaluation?
- A) To estimate performance on unseen data without tuning to it
- B) To avoid measuring performance
- C) To duplicate every row
- D) To make training take longer
**Answer:** A
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-085** | Clustering | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does k-means attempt to do?
- A) Sort records by date
- B) Group points into k clusters around centroids
- C) Predict only text sentiment
- D) Encrypt numeric columns
**Answer:** B
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.

**ML-086** | Deployment | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is model drift?
- A) A monitor changing brightness
- B) A model file being renamed
- C) A change in data patterns that can degrade model performance
- D) A database table being indexed
**Answer:** C
**Explanation:** Changing inputs or relationships can reduce production accuracy.

**ML-087** | Data Preparation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why fit a scaler only on training data before transforming test data?
- A) To increase the number of labels
- B) To ensure all features become categories
- C) To avoid using a model
- D) To prevent information from the test set leaking into preprocessing
**Answer:** D
**Explanation:** Preprocessing fitted on test data can leak information into training.

**ML-088** | Features | Medium
In a practical project, which statement is the most accurate?

Context: What is data leakage?
- A) Using information unavailable at prediction time or leaking target-related information
- B) Splitting data into batches
- C) Compressing features
- D) Deleting duplicate files only
**Answer:** A
**Explanation:** Leakage makes evaluation appear better than real-world performance.

**ML-089** | Evaluation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: For rare fraud cases, which pair is especially useful to inspect?
- A) Rows and columns only
- B) Precision and recall
- C) Screen size and CPU clock
- D) File size and font
**Answer:** B
**Explanation:** Precision and recall reveal different costs of false positives and false negatives.

**ML-090** | Validation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is cross-validation commonly used for?
- A) Encrypting labels
- B) Guaranteeing perfect results
- C) Assessing model stability across multiple data splits
- D) Replacing all data cleaning
**Answer:** C
**Explanation:** Cross-validation evaluates performance across several folds.

**ML-091** | Learning Types | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which is a supervised learning example?
- A) Randomly assigning categories
- B) Compressing an image without labels
- C) Grouping unlabeled customers
- D) Predicting house prices from labeled historical examples
**Answer:** D
**Explanation:** Supervised learning uses examples with target labels.

**ML-092** | Learning Types | Medium
In a practical project, which statement is the most accurate?

Context: Which task is usually unsupervised?
- A) Grouping customers by similarity without known labels
- B) Detecting a known target from labeled data
- C) Estimating a labeled price
- D) Predicting labeled exam scores
**Answer:** A
**Explanation:** Clustering can find structure in unlabeled data.

**ML-093** | Data Preparation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why handle missing values before training?
- A) It guarantees fairness
- B) Many algorithms cannot directly use missing values reliably
- C) Missing values always improve accuracy
- D) It removes the need for testing
**Answer:** B
**Explanation:** Missing data needs an intentional strategy suitable for the dataset.

**ML-094** | Features | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a feature in machine learning?
- A) A server password
- B) A random output label
- C) An input variable used by a model
- D) The final model score only
**Answer:** C
**Explanation:** Features describe examples for the model.

**ML-095** | Regression | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which task is regression?
- A) Assigning an image folder name manually
- B) Grouping documents by similarity
- C) Classifying an email as spam or not spam
- D) Predicting tomorrow's temperature as a numeric value
**Answer:** D
**Explanation:** Regression predicts numeric targets.

**ML-096** | Classification | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Which task is classification?
- A) Predicting whether a transaction is fraudulent
- B) Reducing image file size
- C) Predicting a home's exact price
- D) Sorting rows alphabetically only
**Answer:** A
**Explanation:** Classification predicts discrete classes.

**ML-097** | Evaluation | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: Why can accuracy be misleading on imbalanced data?
- A) Accuracy measures training time
- B) A model may predict the majority class and still score highly
- C) Accuracy is always zero for small data
- D) It cannot be calculated from predictions
**Answer:** B
**Explanation:** Majority-class predictions can hide poor minority-class detection.

**ML-098** | Overfitting | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: A model scores 99% on training data but 60% on test data. What is likely?
- A) Perfect generalization
- B) No training occurred
- C) Overfitting
- D) The test set was used as a feature
**Answer:** C
**Explanation:** A large train-test gap suggests poor generalization.

**ML-099** | Validation | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: Why keep a test set separate until final evaluation?
- A) To duplicate every row
- B) To make training take longer
- C) To avoid measuring performance
- D) To estimate performance on unseen data without tuning to it
**Answer:** D
**Explanation:** Repeatedly tuning on the test set makes the final estimate optimistic.

**ML-100** | Clustering | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What does k-means attempt to do?
- A) Group points into k clusters around centroids
- B) Sort records by date
- C) Predict only text sentiment
- D) Encrypt numeric columns
**Answer:** A
**Explanation:** K-means iteratively assigns points to clusters and updates centroids.


# LLM — LLM

**LLM-001** | Fundamentals | Basic
What does LLM stand for?
- A) Layered Learning Method
- B) Low-Level Memory
- C) Linear Logic Machine
- D) Large Language Model
**Answer:** D
**Explanation:** LLM means Large Language Model.

**LLM-002** | Tokens | Basic
What is a token in an LLM?
- A) A unit of text processed by the model
- B) A GPU cooling component
- C) A login password by definition
- D) A database row
**Answer:** A
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-003** | Prompting | Basic
What is a useful way to improve a prompt for a structured task?
- A) Ask for unrelated tasks together
- B) Specify the goal, context, constraints, and desired output format
- C) Remove all context
- D) Make the request as vague as possible
**Answer:** B
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-004** | Embeddings | Basic
What does a text embedding represent?
- A) A screenshot
- B) A list of HTML tags only
- C) Text as a numeric vector useful for similarity comparisons
- D) A plaintext password
**Answer:** C
**Explanation:** Embeddings map text into a numerical representation.

**LLM-005** | RAG | Basic
What is the main purpose of RAG?
- A) Remove the need for source documents
- B) Guarantee every answer is true
- C) Retrain the whole model for every question
- D) Retrieve relevant external information and provide it to the model as context
**Answer:** D
**Explanation:** RAG grounds generation in retrieved context.

**LLM-006** | Fine-tuning | Basic
When might fine-tuning be useful?
- A) When model behavior or task style needs adaptation using curated examples
- B) To replace all evaluation
- C) To guarantee zero hallucinations
- D) Whenever a fact changes daily and retrieval is available
**Answer:** A
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-007** | Hallucinations | Basic
What is an LLM hallucination?
- A) A longer context window
- B) A plausible-sounding output that is unsupported or incorrect
- C) A correct answer with citations
- D) A database index
**Answer:** B
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-008** | Evaluation | Basic
Why evaluate an LLM on representative prompts?
- A) To avoid checking outputs
- B) To prove the model never fails
- C) To measure task performance and recurring failure modes
- D) To increase token count
**Answer:** C
**Explanation:** Evaluation tests quality against the intended use.

**LLM-009** | Safety | Basic
What is prompt injection?
- A) A CSS layout technique
- B) A database backup strategy
- C) A method for compressing text
- D) Untrusted input attempts to override instructions or manipulate model behavior
**Answer:** D
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-010** | Tool Use | Basic
Why validate arguments before an LLM-triggered tool call?
- A) To prevent malformed or unauthorized actions
- B) To make the model generate longer answers
- C) To remove audit logs
- D) To bypass permissions
**Answer:** A
**Explanation:** Tool calls should be checked against schemas and permissions.

**LLM-011** | RAG | Basic
What is a common cause of poor retrieval in RAG?
- A) The model has a name
- B) Relevant documents were not chunked, indexed, or matched effectively
- C) The user uses punctuation
- D) The answer has a heading
**Answer:** B
**Explanation:** Retrieval quality depends on document preparation and search.

**LLM-012** | Tokens | Basic
What can happen when a prompt exceeds the model's context window?
- A) The database is always deleted
- B) The model automatically learns all content permanently
- C) Some content may need truncation or the request may fail
- D) Every answer becomes more accurate
**Answer:** C
**Explanation:** Context limits constrain how much input and output can fit.

**LLM-013** | Prompting | Basic
Why ask for JSON with a defined schema?
- A) It removes all need for error handling
- B) It encrypts the response
- C) It guarantees factual truth
- D) It makes the expected output structure explicit and easier to validate
**Answer:** D
**Explanation:** A schema helps validate structure but does not guarantee correctness.

**LLM-014** | Hallucinations | Basic
What is a sensible response when retrieved sources do not support an answer?
- A) Say the evidence is insufficient or ask for more information
- B) Pretend a search succeeded
- C) Ignore the sources
- D) Invent a likely citation
**Answer:** A
**Explanation:** Grounded systems should communicate uncertainty when evidence is missing.

**LLM-015** | Safety | Basic
Why should retrieved documents be treated as untrusted input?
- A) They cannot contain text
- B) They may contain malicious instructions or misleading content
- C) All documents are always malicious
- D) It improves font rendering
**Answer:** B
**Explanation:** Retrieved content should not override trusted system instructions or policies.

**LLM-016** | Fundamentals | Basic
What does LLM stand for?
- A) Low-Level Memory
- B) Layered Learning Method
- C) Large Language Model
- D) Linear Logic Machine
**Answer:** C
**Explanation:** LLM means Large Language Model.

**LLM-017** | Tokens | Basic
What is a token in an LLM?
- A) A login password by definition
- B) A database row
- C) A GPU cooling component
- D) A unit of text processed by the model
**Answer:** D
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-018** | Prompting | Basic
What is a useful way to improve a prompt for a structured task?
- A) Specify the goal, context, constraints, and desired output format
- B) Ask for unrelated tasks together
- C) Remove all context
- D) Make the request as vague as possible
**Answer:** A
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-019** | Embeddings | Basic
What does a text embedding represent?
- A) A screenshot
- B) Text as a numeric vector useful for similarity comparisons
- C) A list of HTML tags only
- D) A plaintext password
**Answer:** B
**Explanation:** Embeddings map text into a numerical representation.

**LLM-020** | RAG | Basic
What is the main purpose of RAG?
- A) Guarantee every answer is true
- B) Remove the need for source documents
- C) Retrieve relevant external information and provide it to the model as context
- D) Retrain the whole model for every question
**Answer:** C
**Explanation:** RAG grounds generation in retrieved context.

**LLM-021** | Fine-tuning | Basic
When might fine-tuning be useful?
- A) To guarantee zero hallucinations
- B) To replace all evaluation
- C) Whenever a fact changes daily and retrieval is available
- D) When model behavior or task style needs adaptation using curated examples
**Answer:** D
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-022** | Hallucinations | Basic
What is an LLM hallucination?
- A) A plausible-sounding output that is unsupported or incorrect
- B) A database index
- C) A correct answer with citations
- D) A longer context window
**Answer:** A
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-023** | Evaluation | Basic
Why evaluate an LLM on representative prompts?
- A) To avoid checking outputs
- B) To measure task performance and recurring failure modes
- C) To prove the model never fails
- D) To increase token count
**Answer:** B
**Explanation:** Evaluation tests quality against the intended use.

**LLM-024** | Safety | Basic
What is prompt injection?
- A) A database backup strategy
- B) A CSS layout technique
- C) Untrusted input attempts to override instructions or manipulate model behavior
- D) A method for compressing text
**Answer:** C
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-025** | Tool Use | Basic
Why validate arguments before an LLM-triggered tool call?
- A) To remove audit logs
- B) To make the model generate longer answers
- C) To bypass permissions
- D) To prevent malformed or unauthorized actions
**Answer:** D
**Explanation:** Tool calls should be checked against schemas and permissions.

**LLM-026** | RAG | Basic
What is a common cause of poor retrieval in RAG?
- A) Relevant documents were not chunked, indexed, or matched effectively
- B) The answer has a heading
- C) The user uses punctuation
- D) The model has a name
**Answer:** A
**Explanation:** Retrieval quality depends on document preparation and search.

**LLM-027** | Tokens | Basic
What can happen when a prompt exceeds the model's context window?
- A) Every answer becomes more accurate
- B) Some content may need truncation or the request may fail
- C) The model automatically learns all content permanently
- D) The database is always deleted
**Answer:** B
**Explanation:** Context limits constrain how much input and output can fit.

**LLM-028** | Prompting | Basic
Why ask for JSON with a defined schema?
- A) It removes all need for error handling
- B) It encrypts the response
- C) It makes the expected output structure explicit and easier to validate
- D) It guarantees factual truth
**Answer:** C
**Explanation:** A schema helps validate structure but does not guarantee correctness.

**LLM-029** | Hallucinations | Basic
What is a sensible response when retrieved sources do not support an answer?
- A) Pretend a search succeeded
- B) Ignore the sources
- C) Invent a likely citation
- D) Say the evidence is insufficient or ask for more information
**Answer:** D
**Explanation:** Grounded systems should communicate uncertainty when evidence is missing.

**LLM-030** | Safety | Basic
Why should retrieved documents be treated as untrusted input?
- A) They may contain malicious instructions or misleading content
- B) All documents are always malicious
- C) It improves font rendering
- D) They cannot contain text
**Answer:** A
**Explanation:** Retrieved content should not override trusted system instructions or policies.

**LLM-031** | Fundamentals | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does LLM stand for?
- A) Linear Logic Machine
- B) Large Language Model
- C) Low-Level Memory
- D) Layered Learning Method
**Answer:** B
**Explanation:** LLM means Large Language Model.

**LLM-032** | Tokens | Medium
In a practical project, which statement is the most accurate?

Context: What is a token in an LLM?
- A) A login password by definition
- B) A database row
- C) A unit of text processed by the model
- D) A GPU cooling component
**Answer:** C
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-033** | Prompting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a useful way to improve a prompt for a structured task?
- A) Remove all context
- B) Make the request as vague as possible
- C) Ask for unrelated tasks together
- D) Specify the goal, context, constraints, and desired output format
**Answer:** D
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-034** | Embeddings | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a text embedding represent?
- A) Text as a numeric vector useful for similarity comparisons
- B) A list of HTML tags only
- C) A plaintext password
- D) A screenshot
**Answer:** A
**Explanation:** Embeddings map text into a numerical representation.

**LLM-035** | RAG | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the main purpose of RAG?
- A) Guarantee every answer is true
- B) Retrieve relevant external information and provide it to the model as context
- C) Retrain the whole model for every question
- D) Remove the need for source documents
**Answer:** B
**Explanation:** RAG grounds generation in retrieved context.

**LLM-036** | Fine-tuning | Medium
In a practical project, which statement is the most accurate?

Context: When might fine-tuning be useful?
- A) To guarantee zero hallucinations
- B) To replace all evaluation
- C) When model behavior or task style needs adaptation using curated examples
- D) Whenever a fact changes daily and retrieval is available
**Answer:** C
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-037** | Hallucinations | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is an LLM hallucination?
- A) A database index
- B) A longer context window
- C) A correct answer with citations
- D) A plausible-sounding output that is unsupported or incorrect
**Answer:** D
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-038** | Evaluation | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why evaluate an LLM on representative prompts?
- A) To measure task performance and recurring failure modes
- B) To avoid checking outputs
- C) To increase token count
- D) To prove the model never fails
**Answer:** A
**Explanation:** Evaluation tests quality against the intended use.

**LLM-039** | Safety | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is prompt injection?
- A) A database backup strategy
- B) Untrusted input attempts to override instructions or manipulate model behavior
- C) A method for compressing text
- D) A CSS layout technique
**Answer:** B
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-040** | Tool Use | Medium
In a practical project, which statement is the most accurate?

Context: Why validate arguments before an LLM-triggered tool call?
- A) To remove audit logs
- B) To bypass permissions
- C) To prevent malformed or unauthorized actions
- D) To make the model generate longer answers
**Answer:** C
**Explanation:** Tool calls should be checked against schemas and permissions.

**LLM-041** | RAG | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a common cause of poor retrieval in RAG?
- A) The user uses punctuation
- B) The model has a name
- C) The answer has a heading
- D) Relevant documents were not chunked, indexed, or matched effectively
**Answer:** D
**Explanation:** Retrieval quality depends on document preparation and search.

**LLM-042** | Tokens | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What can happen when a prompt exceeds the model's context window?
- A) Some content may need truncation or the request may fail
- B) Every answer becomes more accurate
- C) The database is always deleted
- D) The model automatically learns all content permanently
**Answer:** A
**Explanation:** Context limits constrain how much input and output can fit.

**LLM-043** | Prompting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why ask for JSON with a defined schema?
- A) It removes all need for error handling
- B) It makes the expected output structure explicit and easier to validate
- C) It encrypts the response
- D) It guarantees factual truth
**Answer:** B
**Explanation:** A schema helps validate structure but does not guarantee correctness.

**LLM-044** | Hallucinations | Medium
In a practical project, which statement is the most accurate?

Context: What is a sensible response when retrieved sources do not support an answer?
- A) Invent a likely citation
- B) Pretend a search succeeded
- C) Say the evidence is insufficient or ask for more information
- D) Ignore the sources
**Answer:** C
**Explanation:** Grounded systems should communicate uncertainty when evidence is missing.

**LLM-045** | Safety | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should retrieved documents be treated as untrusted input?
- A) They cannot contain text
- B) It improves font rendering
- C) All documents are always malicious
- D) They may contain malicious instructions or misleading content
**Answer:** D
**Explanation:** Retrieved content should not override trusted system instructions or policies.

**LLM-046** | Fundamentals | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does LLM stand for?
- A) Large Language Model
- B) Linear Logic Machine
- C) Layered Learning Method
- D) Low-Level Memory
**Answer:** A
**Explanation:** LLM means Large Language Model.

**LLM-047** | Tokens | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a token in an LLM?
- A) A GPU cooling component
- B) A unit of text processed by the model
- C) A login password by definition
- D) A database row
**Answer:** B
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-048** | Prompting | Medium
In a practical project, which statement is the most accurate?

Context: What is a useful way to improve a prompt for a structured task?
- A) Remove all context
- B) Ask for unrelated tasks together
- C) Specify the goal, context, constraints, and desired output format
- D) Make the request as vague as possible
**Answer:** C
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-049** | Embeddings | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does a text embedding represent?
- A) A list of HTML tags only
- B) A plaintext password
- C) A screenshot
- D) Text as a numeric vector useful for similarity comparisons
**Answer:** D
**Explanation:** Embeddings map text into a numerical representation.

**LLM-050** | RAG | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the main purpose of RAG?
- A) Retrieve relevant external information and provide it to the model as context
- B) Retrain the whole model for every question
- C) Guarantee every answer is true
- D) Remove the need for source documents
**Answer:** A
**Explanation:** RAG grounds generation in retrieved context.

**LLM-051** | Fine-tuning | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: When might fine-tuning be useful?
- A) To guarantee zero hallucinations
- B) When model behavior or task style needs adaptation using curated examples
- C) To replace all evaluation
- D) Whenever a fact changes daily and retrieval is available
**Answer:** B
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-052** | Hallucinations | Medium
In a practical project, which statement is the most accurate?

Context: What is an LLM hallucination?
- A) A longer context window
- B) A correct answer with citations
- C) A plausible-sounding output that is unsupported or incorrect
- D) A database index
**Answer:** C
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-053** | Evaluation | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why evaluate an LLM on representative prompts?
- A) To increase token count
- B) To avoid checking outputs
- C) To prove the model never fails
- D) To measure task performance and recurring failure modes
**Answer:** D
**Explanation:** Evaluation tests quality against the intended use.

**LLM-054** | Safety | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is prompt injection?
- A) Untrusted input attempts to override instructions or manipulate model behavior
- B) A CSS layout technique
- C) A database backup strategy
- D) A method for compressing text
**Answer:** A
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-055** | Tool Use | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why validate arguments before an LLM-triggered tool call?
- A) To make the model generate longer answers
- B) To prevent malformed or unauthorized actions
- C) To remove audit logs
- D) To bypass permissions
**Answer:** B
**Explanation:** Tool calls should be checked against schemas and permissions.

**LLM-056** | RAG | Medium
In a practical project, which statement is the most accurate?

Context: What is a common cause of poor retrieval in RAG?
- A) The answer has a heading
- B) The user uses punctuation
- C) Relevant documents were not chunked, indexed, or matched effectively
- D) The model has a name
**Answer:** C
**Explanation:** Retrieval quality depends on document preparation and search.

**LLM-057** | Tokens | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What can happen when a prompt exceeds the model's context window?
- A) Every answer becomes more accurate
- B) The database is always deleted
- C) The model automatically learns all content permanently
- D) Some content may need truncation or the request may fail
**Answer:** D
**Explanation:** Context limits constrain how much input and output can fit.

**LLM-058** | Prompting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why ask for JSON with a defined schema?
- A) It makes the expected output structure explicit and easier to validate
- B) It guarantees factual truth
- C) It removes all need for error handling
- D) It encrypts the response
**Answer:** A
**Explanation:** A schema helps validate structure but does not guarantee correctness.

**LLM-059** | Hallucinations | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a sensible response when retrieved sources do not support an answer?
- A) Invent a likely citation
- B) Say the evidence is insufficient or ask for more information
- C) Pretend a search succeeded
- D) Ignore the sources
**Answer:** B
**Explanation:** Grounded systems should communicate uncertainty when evidence is missing.

**LLM-060** | Safety | Medium
In a practical project, which statement is the most accurate?

Context: Why should retrieved documents be treated as untrusted input?
- A) All documents are always malicious
- B) They cannot contain text
- C) They may contain malicious instructions or misleading content
- D) It improves font rendering
**Answer:** C
**Explanation:** Retrieved content should not override trusted system instructions or policies.

**LLM-061** | Fundamentals | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does LLM stand for?
- A) Layered Learning Method
- B) Linear Logic Machine
- C) Low-Level Memory
- D) Large Language Model
**Answer:** D
**Explanation:** LLM means Large Language Model.

**LLM-062** | Tokens | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a token in an LLM?
- A) A unit of text processed by the model
- B) A login password by definition
- C) A GPU cooling component
- D) A database row
**Answer:** A
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-063** | Prompting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a useful way to improve a prompt for a structured task?
- A) Ask for unrelated tasks together
- B) Specify the goal, context, constraints, and desired output format
- C) Make the request as vague as possible
- D) Remove all context
**Answer:** B
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-064** | Embeddings | Medium
In a practical project, which statement is the most accurate?

Context: What does a text embedding represent?
- A) A screenshot
- B) A plaintext password
- C) Text as a numeric vector useful for similarity comparisons
- D) A list of HTML tags only
**Answer:** C
**Explanation:** Embeddings map text into a numerical representation.

**LLM-065** | RAG | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the main purpose of RAG?
- A) Retrain the whole model for every question
- B) Guarantee every answer is true
- C) Remove the need for source documents
- D) Retrieve relevant external information and provide it to the model as context
**Answer:** D
**Explanation:** RAG grounds generation in retrieved context.

**LLM-066** | Fine-tuning | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: When might fine-tuning be useful?
- A) When model behavior or task style needs adaptation using curated examples
- B) Whenever a fact changes daily and retrieval is available
- C) To guarantee zero hallucinations
- D) To replace all evaluation
**Answer:** A
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-067** | Hallucinations | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is an LLM hallucination?
- A) A database index
- B) A plausible-sounding output that is unsupported or incorrect
- C) A longer context window
- D) A correct answer with citations
**Answer:** B
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-068** | Evaluation | Medium
In a practical project, which statement is the most accurate?

Context: Why evaluate an LLM on representative prompts?
- A) To increase token count
- B) To prove the model never fails
- C) To measure task performance and recurring failure modes
- D) To avoid checking outputs
**Answer:** C
**Explanation:** Evaluation tests quality against the intended use.

**LLM-069** | Safety | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is prompt injection?
- A) A CSS layout technique
- B) A method for compressing text
- C) A database backup strategy
- D) Untrusted input attempts to override instructions or manipulate model behavior
**Answer:** D
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-070** | Tool Use | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why validate arguments before an LLM-triggered tool call?
- A) To prevent malformed or unauthorized actions
- B) To make the model generate longer answers
- C) To bypass permissions
- D) To remove audit logs
**Answer:** A
**Explanation:** Tool calls should be checked against schemas and permissions.

**LLM-071** | RAG | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common cause of poor retrieval in RAG?
- A) The answer has a heading
- B) Relevant documents were not chunked, indexed, or matched effectively
- C) The model has a name
- D) The user uses punctuation
**Answer:** B
**Explanation:** Retrieval quality depends on document preparation and search.

**LLM-072** | Tokens | Medium
In a practical project, which statement is the most accurate?

Context: What can happen when a prompt exceeds the model's context window?
- A) The database is always deleted
- B) Every answer becomes more accurate
- C) Some content may need truncation or the request may fail
- D) The model automatically learns all content permanently
**Answer:** C
**Explanation:** Context limits constrain how much input and output can fit.

**LLM-073** | Prompting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why ask for JSON with a defined schema?
- A) It guarantees factual truth
- B) It removes all need for error handling
- C) It encrypts the response
- D) It makes the expected output structure explicit and easier to validate
**Answer:** D
**Explanation:** A schema helps validate structure but does not guarantee correctness.

**LLM-074** | Hallucinations | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a sensible response when retrieved sources do not support an answer?
- A) Say the evidence is insufficient or ask for more information
- B) Ignore the sources
- C) Pretend a search succeeded
- D) Invent a likely citation
**Answer:** A
**Explanation:** Grounded systems should communicate uncertainty when evidence is missing.

**LLM-075** | Safety | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should retrieved documents be treated as untrusted input?
- A) All documents are always malicious
- B) They may contain malicious instructions or misleading content
- C) It improves font rendering
- D) They cannot contain text
**Answer:** B
**Explanation:** Retrieved content should not override trusted system instructions or policies.

**LLM-076** | Fundamentals | Medium
In a practical project, which statement is the most accurate?

Context: What does LLM stand for?
- A) Linear Logic Machine
- B) Layered Learning Method
- C) Large Language Model
- D) Low-Level Memory
**Answer:** C
**Explanation:** LLM means Large Language Model.

**LLM-077** | Tokens | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a token in an LLM?
- A) A database row
- B) A GPU cooling component
- C) A login password by definition
- D) A unit of text processed by the model
**Answer:** D
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-078** | Prompting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a useful way to improve a prompt for a structured task?
- A) Specify the goal, context, constraints, and desired output format
- B) Make the request as vague as possible
- C) Ask for unrelated tasks together
- D) Remove all context
**Answer:** A
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-079** | Embeddings | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does a text embedding represent?
- A) A list of HTML tags only
- B) Text as a numeric vector useful for similarity comparisons
- C) A screenshot
- D) A plaintext password
**Answer:** B
**Explanation:** Embeddings map text into a numerical representation.

**LLM-080** | RAG | Medium
In a practical project, which statement is the most accurate?

Context: What is the main purpose of RAG?
- A) Guarantee every answer is true
- B) Remove the need for source documents
- C) Retrieve relevant external information and provide it to the model as context
- D) Retrain the whole model for every question
**Answer:** C
**Explanation:** RAG grounds generation in retrieved context.

**LLM-081** | Fine-tuning | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: When might fine-tuning be useful?
- A) To replace all evaluation
- B) To guarantee zero hallucinations
- C) Whenever a fact changes daily and retrieval is available
- D) When model behavior or task style needs adaptation using curated examples
**Answer:** D
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-082** | Hallucinations | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is an LLM hallucination?
- A) A plausible-sounding output that is unsupported or incorrect
- B) A database index
- C) A longer context window
- D) A correct answer with citations
**Answer:** A
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-083** | Evaluation | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why evaluate an LLM on representative prompts?
- A) To avoid checking outputs
- B) To measure task performance and recurring failure modes
- C) To prove the model never fails
- D) To increase token count
**Answer:** B
**Explanation:** Evaluation tests quality against the intended use.

**LLM-084** | Safety | Medium
In a practical project, which statement is the most accurate?

Context: What is prompt injection?
- A) A method for compressing text
- B) A CSS layout technique
- C) Untrusted input attempts to override instructions or manipulate model behavior
- D) A database backup strategy
**Answer:** C
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-085** | Tool Use | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why validate arguments before an LLM-triggered tool call?
- A) To bypass permissions
- B) To remove audit logs
- C) To make the model generate longer answers
- D) To prevent malformed or unauthorized actions
**Answer:** D
**Explanation:** Tool calls should be checked against schemas and permissions.

**LLM-086** | RAG | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a common cause of poor retrieval in RAG?
- A) Relevant documents were not chunked, indexed, or matched effectively
- B) The answer has a heading
- C) The user uses punctuation
- D) The model has a name
**Answer:** A
**Explanation:** Retrieval quality depends on document preparation and search.

**LLM-087** | Tokens | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What can happen when a prompt exceeds the model's context window?
- A) The model automatically learns all content permanently
- B) Some content may need truncation or the request may fail
- C) Every answer becomes more accurate
- D) The database is always deleted
**Answer:** B
**Explanation:** Context limits constrain how much input and output can fit.

**LLM-088** | Prompting | Medium
In a practical project, which statement is the most accurate?

Context: Why ask for JSON with a defined schema?
- A) It removes all need for error handling
- B) It encrypts the response
- C) It makes the expected output structure explicit and easier to validate
- D) It guarantees factual truth
**Answer:** C
**Explanation:** A schema helps validate structure but does not guarantee correctness.

**LLM-089** | Hallucinations | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a sensible response when retrieved sources do not support an answer?
- A) Invent a likely citation
- B) Ignore the sources
- C) Pretend a search succeeded
- D) Say the evidence is insufficient or ask for more information
**Answer:** D
**Explanation:** Grounded systems should communicate uncertainty when evidence is missing.

**LLM-090** | Safety | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why should retrieved documents be treated as untrusted input?
- A) They may contain malicious instructions or misleading content
- B) It improves font rendering
- C) All documents are always malicious
- D) They cannot contain text
**Answer:** A
**Explanation:** Retrieved content should not override trusted system instructions or policies.

**LLM-091** | Fundamentals | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does LLM stand for?
- A) Layered Learning Method
- B) Large Language Model
- C) Linear Logic Machine
- D) Low-Level Memory
**Answer:** B
**Explanation:** LLM means Large Language Model.

**LLM-092** | Tokens | Medium
In a practical project, which statement is the most accurate?

Context: What is a token in an LLM?
- A) A database row
- B) A login password by definition
- C) A unit of text processed by the model
- D) A GPU cooling component
**Answer:** C
**Explanation:** Tokens can be words, word pieces, or other text units.

**LLM-093** | Prompting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a useful way to improve a prompt for a structured task?
- A) Remove all context
- B) Ask for unrelated tasks together
- C) Make the request as vague as possible
- D) Specify the goal, context, constraints, and desired output format
**Answer:** D
**Explanation:** Clear instructions and output requirements reduce ambiguity.

**LLM-094** | Embeddings | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a text embedding represent?
- A) Text as a numeric vector useful for similarity comparisons
- B) A list of HTML tags only
- C) A screenshot
- D) A plaintext password
**Answer:** A
**Explanation:** Embeddings map text into a numerical representation.

**LLM-095** | RAG | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the main purpose of RAG?
- A) Retrain the whole model for every question
- B) Retrieve relevant external information and provide it to the model as context
- C) Remove the need for source documents
- D) Guarantee every answer is true
**Answer:** B
**Explanation:** RAG grounds generation in retrieved context.

**LLM-096** | Fine-tuning | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: When might fine-tuning be useful?
- A) Whenever a fact changes daily and retrieval is available
- B) To replace all evaluation
- C) When model behavior or task style needs adaptation using curated examples
- D) To guarantee zero hallucinations
**Answer:** C
**Explanation:** Fine-tuning can adapt behavior, but is not a universal way to update facts.

**LLM-097** | Hallucinations | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: What is an LLM hallucination?
- A) A correct answer with citations
- B) A longer context window
- C) A database index
- D) A plausible-sounding output that is unsupported or incorrect
**Answer:** D
**Explanation:** Fluent output is not proof of factual correctness.

**LLM-098** | Evaluation | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: Why evaluate an LLM on representative prompts?
- A) To measure task performance and recurring failure modes
- B) To avoid checking outputs
- C) To increase token count
- D) To prove the model never fails
**Answer:** A
**Explanation:** Evaluation tests quality against the intended use.

**LLM-099** | Safety | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: What is prompt injection?
- A) A database backup strategy
- B) Untrusted input attempts to override instructions or manipulate model behavior
- C) A CSS layout technique
- D) A method for compressing text
**Answer:** B
**Explanation:** Prompt injection attempts to influence how a model follows instructions.

**LLM-100** | Tool Use | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Why validate arguments before an LLM-triggered tool call?
- A) To remove audit logs
- B) To make the model generate longer answers
- C) To prevent malformed or unauthorized actions
- D) To bypass permissions
**Answer:** C
**Explanation:** Tool calls should be checked against schemas and permissions.


# CS — Cyber Security

**CS-001** | CIA Triad | Basic
What does the CIA triad stand for?
- A) Central Intelligence Agency
- B) Control, Identity, Access
- C) Confidentiality, Integrity, Availability
- D) Cryptography, Intrusion, Authentication
**Answer:** C
**Explanation:** The triad describes core information security goals.

**CS-002** | Passwords | Basic
Why use a unique password for each service?
- A) It removes the need for MFA
- B) It makes every password public
- C) It eliminates phishing
- D) A breach at one service is less likely to compromise other accounts
**Answer:** D
**Explanation:** Unique passwords limit credential reuse risk.

**CS-003** | Authentication | Basic
What is multi-factor authentication?
- A) Using two or more different categories of verification
- B) Changing a username daily
- C) Encrypting a public webpage only
- D) Using the same password twice
**Answer:** A
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-004** | Web Attacks | Basic
What is phishing?
- A) A database indexing technique
- B) A deceptive attempt to trick people into revealing data or taking unsafe actions
- C) A software license
- D) A method to compress files
**Answer:** B
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-005** | SQL Injection | Basic
What is a strong defense against SQL injection?
- A) Hiding the submit button
- B) Increasing screen resolution
- C) Parameterized queries or prepared statements
- D) Longer table names
**Answer:** C
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-006** | XSS | Basic
What occurs in cross-site scripting?
- A) A hard drive is physically removed
- B) A server receives too few requests
- C) A password hash is generated
- D) Attacker-controlled script runs in another user's browser context
**Answer:** D
**Explanation:** XSS injects script into content viewed by users.

**CS-007** | Networking | Basic
What does a firewall commonly do?
- A) Allow or block network traffic according to rules
- B) Create strong user passwords automatically
- C) Guarantee software has no bugs
- D) Replace application logging
**Answer:** A
**Explanation:** Firewalls enforce traffic policies.

**CS-008** | Encryption | Basic
What is the key difference between hashing and encryption?
- A) Encryption cannot protect data
- B) Encryption is designed to be reversible with a key; hashing is generally one-way
- C) They are identical in all uses
- D) Hashing always needs two keys
**Answer:** B
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-009** | Access Control | Basic
What does least privilege mean?
- A) Give every user admin rights
- B) Share accounts for convenience
- C) Give each account only the access required for its work
- D) Disable authentication
**Answer:** C
**Explanation:** Minimal permissions reduce potential damage.

**CS-010** | Incident Response | Basic
What is a sensible first response to a suspected compromised account?
- A) Delete all logs immediately
- B) Publicly post the password
- C) Ignore it until next month
- D) Follow the incident process to contain access and preserve relevant evidence
**Answer:** D
**Explanation:** Containment and evidence preservation support effective response.

**CS-011** | Passwords | Basic
Why use a password manager?
- A) To generate and store strong unique passwords securely
- B) To disable updates
- C) To guarantee a device cannot be infected
- D) To share all passwords with coworkers
**Answer:** A
**Explanation:** A reputable manager supports unique credentials.

**CS-012** | Authentication | Basic
Why is MFA useful if a password is stolen?
- A) It makes the password unchangeable
- B) The attacker may still lack the additional factor
- C) It prevents every social-engineering attack
- D) It encrypts all public websites
**Answer:** B
**Explanation:** A second factor adds a barrier beyond the password.

**CS-013** | Web Attacks | Basic
What is a denial-of-service attack intended to do?
- A) Rotate encryption keys
- B) Improve the database schema
- C) Make a service unavailable to legitimate users
- D) Create a stronger password
**Answer:** C
**Explanation:** DoS attacks exhaust resources or disrupt service.

**CS-014** | Encryption | Basic
Why should sensitive traffic use HTTPS?
- A) It prevents all endpoint malware
- B) It replaces authorization checks
- C) It hides all bugs from developers
- D) TLS protects traffic confidentiality and integrity in transit and authenticates the server
**Answer:** D
**Explanation:** HTTPS uses TLS to protect communication between client and server.

**CS-015** | Incident Response | Basic
Why preserve logs after a security incident?
- A) They can help reconstruct events and support investigation
- B) They replace backups
- C) They prevent every future attack automatically
- D) They always contain no sensitive data
**Answer:** A
**Explanation:** Logs are important evidence when handled securely.

**CS-016** | CIA Triad | Basic
What does the CIA triad stand for?
- A) Central Intelligence Agency
- B) Confidentiality, Integrity, Availability
- C) Cryptography, Intrusion, Authentication
- D) Control, Identity, Access
**Answer:** B
**Explanation:** The triad describes core information security goals.

**CS-017** | Passwords | Basic
Why use a unique password for each service?
- A) It makes every password public
- B) It removes the need for MFA
- C) A breach at one service is less likely to compromise other accounts
- D) It eliminates phishing
**Answer:** C
**Explanation:** Unique passwords limit credential reuse risk.

**CS-018** | Authentication | Basic
What is multi-factor authentication?
- A) Changing a username daily
- B) Using the same password twice
- C) Encrypting a public webpage only
- D) Using two or more different categories of verification
**Answer:** D
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-019** | Web Attacks | Basic
What is phishing?
- A) A deceptive attempt to trick people into revealing data or taking unsafe actions
- B) A database indexing technique
- C) A software license
- D) A method to compress files
**Answer:** A
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-020** | SQL Injection | Basic
What is a strong defense against SQL injection?
- A) Increasing screen resolution
- B) Parameterized queries or prepared statements
- C) Hiding the submit button
- D) Longer table names
**Answer:** B
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-021** | XSS | Basic
What occurs in cross-site scripting?
- A) A server receives too few requests
- B) A password hash is generated
- C) Attacker-controlled script runs in another user's browser context
- D) A hard drive is physically removed
**Answer:** C
**Explanation:** XSS injects script into content viewed by users.

**CS-022** | Networking | Basic
What does a firewall commonly do?
- A) Guarantee software has no bugs
- B) Replace application logging
- C) Create strong user passwords automatically
- D) Allow or block network traffic according to rules
**Answer:** D
**Explanation:** Firewalls enforce traffic policies.

**CS-023** | Encryption | Basic
What is the key difference between hashing and encryption?
- A) Encryption is designed to be reversible with a key; hashing is generally one-way
- B) Encryption cannot protect data
- C) Hashing always needs two keys
- D) They are identical in all uses
**Answer:** A
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-024** | Access Control | Basic
What does least privilege mean?
- A) Disable authentication
- B) Give each account only the access required for its work
- C) Give every user admin rights
- D) Share accounts for convenience
**Answer:** B
**Explanation:** Minimal permissions reduce potential damage.

**CS-025** | Incident Response | Basic
What is a sensible first response to a suspected compromised account?
- A) Ignore it until next month
- B) Publicly post the password
- C) Follow the incident process to contain access and preserve relevant evidence
- D) Delete all logs immediately
**Answer:** C
**Explanation:** Containment and evidence preservation support effective response.

**CS-026** | Passwords | Basic
Why use a password manager?
- A) To disable updates
- B) To guarantee a device cannot be infected
- C) To share all passwords with coworkers
- D) To generate and store strong unique passwords securely
**Answer:** D
**Explanation:** A reputable manager supports unique credentials.

**CS-027** | Authentication | Basic
Why is MFA useful if a password is stolen?
- A) The attacker may still lack the additional factor
- B) It encrypts all public websites
- C) It makes the password unchangeable
- D) It prevents every social-engineering attack
**Answer:** A
**Explanation:** A second factor adds a barrier beyond the password.

**CS-028** | Web Attacks | Basic
What is a denial-of-service attack intended to do?
- A) Improve the database schema
- B) Make a service unavailable to legitimate users
- C) Create a stronger password
- D) Rotate encryption keys
**Answer:** B
**Explanation:** DoS attacks exhaust resources or disrupt service.

**CS-029** | Encryption | Basic
Why should sensitive traffic use HTTPS?
- A) It prevents all endpoint malware
- B) It replaces authorization checks
- C) TLS protects traffic confidentiality and integrity in transit and authenticates the server
- D) It hides all bugs from developers
**Answer:** C
**Explanation:** HTTPS uses TLS to protect communication between client and server.

**CS-030** | Incident Response | Basic
Why preserve logs after a security incident?
- A) They always contain no sensitive data
- B) They replace backups
- C) They prevent every future attack automatically
- D) They can help reconstruct events and support investigation
**Answer:** D
**Explanation:** Logs are important evidence when handled securely.

**CS-031** | CIA Triad | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does the CIA triad stand for?
- A) Confidentiality, Integrity, Availability
- B) Control, Identity, Access
- C) Cryptography, Intrusion, Authentication
- D) Central Intelligence Agency
**Answer:** A
**Explanation:** The triad describes core information security goals.

**CS-032** | Passwords | Medium
In a practical project, which statement is the most accurate?

Context: Why use a unique password for each service?
- A) It eliminates phishing
- B) A breach at one service is less likely to compromise other accounts
- C) It removes the need for MFA
- D) It makes every password public
**Answer:** B
**Explanation:** Unique passwords limit credential reuse risk.

**CS-033** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is multi-factor authentication?
- A) Changing a username daily
- B) Encrypting a public webpage only
- C) Using two or more different categories of verification
- D) Using the same password twice
**Answer:** C
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-034** | Web Attacks | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is phishing?
- A) A software license
- B) A database indexing technique
- C) A method to compress files
- D) A deceptive attempt to trick people into revealing data or taking unsafe actions
**Answer:** D
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-035** | SQL Injection | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a strong defense against SQL injection?
- A) Parameterized queries or prepared statements
- B) Increasing screen resolution
- C) Hiding the submit button
- D) Longer table names
**Answer:** A
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-036** | XSS | Medium
In a practical project, which statement is the most accurate?

Context: What occurs in cross-site scripting?
- A) A hard drive is physically removed
- B) Attacker-controlled script runs in another user's browser context
- C) A server receives too few requests
- D) A password hash is generated
**Answer:** B
**Explanation:** XSS injects script into content viewed by users.

**CS-037** | Networking | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does a firewall commonly do?
- A) Replace application logging
- B) Guarantee software has no bugs
- C) Allow or block network traffic according to rules
- D) Create strong user passwords automatically
**Answer:** C
**Explanation:** Firewalls enforce traffic policies.

**CS-038** | Encryption | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the key difference between hashing and encryption?
- A) They are identical in all uses
- B) Encryption cannot protect data
- C) Hashing always needs two keys
- D) Encryption is designed to be reversible with a key; hashing is generally one-way
**Answer:** D
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-039** | Access Control | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does least privilege mean?
- A) Give each account only the access required for its work
- B) Give every user admin rights
- C) Disable authentication
- D) Share accounts for convenience
**Answer:** A
**Explanation:** Minimal permissions reduce potential damage.

**CS-040** | Incident Response | Medium
In a practical project, which statement is the most accurate?

Context: What is a sensible first response to a suspected compromised account?
- A) Publicly post the password
- B) Follow the incident process to contain access and preserve relevant evidence
- C) Delete all logs immediately
- D) Ignore it until next month
**Answer:** B
**Explanation:** Containment and evidence preservation support effective response.

**CS-041** | Passwords | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why use a password manager?
- A) To guarantee a device cannot be infected
- B) To share all passwords with coworkers
- C) To generate and store strong unique passwords securely
- D) To disable updates
**Answer:** C
**Explanation:** A reputable manager supports unique credentials.

**CS-042** | Authentication | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why is MFA useful if a password is stolen?
- A) It prevents every social-engineering attack
- B) It makes the password unchangeable
- C) It encrypts all public websites
- D) The attacker may still lack the additional factor
**Answer:** D
**Explanation:** A second factor adds a barrier beyond the password.

**CS-043** | Web Attacks | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a denial-of-service attack intended to do?
- A) Make a service unavailable to legitimate users
- B) Create a stronger password
- C) Improve the database schema
- D) Rotate encryption keys
**Answer:** A
**Explanation:** DoS attacks exhaust resources or disrupt service.

**CS-044** | Encryption | Medium
In a practical project, which statement is the most accurate?

Context: Why should sensitive traffic use HTTPS?
- A) It prevents all endpoint malware
- B) TLS protects traffic confidentiality and integrity in transit and authenticates the server
- C) It replaces authorization checks
- D) It hides all bugs from developers
**Answer:** B
**Explanation:** HTTPS uses TLS to protect communication between client and server.

**CS-045** | Incident Response | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why preserve logs after a security incident?
- A) They always contain no sensitive data
- B) They replace backups
- C) They can help reconstruct events and support investigation
- D) They prevent every future attack automatically
**Answer:** C
**Explanation:** Logs are important evidence when handled securely.

**CS-046** | CIA Triad | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does the CIA triad stand for?
- A) Cryptography, Intrusion, Authentication
- B) Control, Identity, Access
- C) Central Intelligence Agency
- D) Confidentiality, Integrity, Availability
**Answer:** D
**Explanation:** The triad describes core information security goals.

**CS-047** | Passwords | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why use a unique password for each service?
- A) A breach at one service is less likely to compromise other accounts
- B) It makes every password public
- C) It eliminates phishing
- D) It removes the need for MFA
**Answer:** A
**Explanation:** Unique passwords limit credential reuse risk.

**CS-048** | Authentication | Medium
In a practical project, which statement is the most accurate?

Context: What is multi-factor authentication?
- A) Using the same password twice
- B) Using two or more different categories of verification
- C) Encrypting a public webpage only
- D) Changing a username daily
**Answer:** B
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-049** | Web Attacks | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is phishing?
- A) A method to compress files
- B) A software license
- C) A deceptive attempt to trick people into revealing data or taking unsafe actions
- D) A database indexing technique
**Answer:** C
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-050** | SQL Injection | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a strong defense against SQL injection?
- A) Hiding the submit button
- B) Increasing screen resolution
- C) Longer table names
- D) Parameterized queries or prepared statements
**Answer:** D
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-051** | XSS | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What occurs in cross-site scripting?
- A) Attacker-controlled script runs in another user's browser context
- B) A password hash is generated
- C) A hard drive is physically removed
- D) A server receives too few requests
**Answer:** A
**Explanation:** XSS injects script into content viewed by users.

**CS-052** | Networking | Medium
In a practical project, which statement is the most accurate?

Context: What does a firewall commonly do?
- A) Replace application logging
- B) Allow or block network traffic according to rules
- C) Guarantee software has no bugs
- D) Create strong user passwords automatically
**Answer:** B
**Explanation:** Firewalls enforce traffic policies.

**CS-053** | Encryption | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the key difference between hashing and encryption?
- A) Encryption cannot protect data
- B) They are identical in all uses
- C) Encryption is designed to be reversible with a key; hashing is generally one-way
- D) Hashing always needs two keys
**Answer:** C
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-054** | Access Control | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does least privilege mean?
- A) Give every user admin rights
- B) Share accounts for convenience
- C) Disable authentication
- D) Give each account only the access required for its work
**Answer:** D
**Explanation:** Minimal permissions reduce potential damage.

**CS-055** | Incident Response | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a sensible first response to a suspected compromised account?
- A) Follow the incident process to contain access and preserve relevant evidence
- B) Delete all logs immediately
- C) Ignore it until next month
- D) Publicly post the password
**Answer:** A
**Explanation:** Containment and evidence preservation support effective response.

**CS-056** | Passwords | Medium
In a practical project, which statement is the most accurate?

Context: Why use a password manager?
- A) To disable updates
- B) To generate and store strong unique passwords securely
- C) To guarantee a device cannot be infected
- D) To share all passwords with coworkers
**Answer:** B
**Explanation:** A reputable manager supports unique credentials.

**CS-057** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why is MFA useful if a password is stolen?
- A) It makes the password unchangeable
- B) It prevents every social-engineering attack
- C) The attacker may still lack the additional factor
- D) It encrypts all public websites
**Answer:** C
**Explanation:** A second factor adds a barrier beyond the password.

**CS-058** | Web Attacks | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a denial-of-service attack intended to do?
- A) Create a stronger password
- B) Rotate encryption keys
- C) Improve the database schema
- D) Make a service unavailable to legitimate users
**Answer:** D
**Explanation:** DoS attacks exhaust resources or disrupt service.

**CS-059** | Encryption | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why should sensitive traffic use HTTPS?
- A) TLS protects traffic confidentiality and integrity in transit and authenticates the server
- B) It hides all bugs from developers
- C) It prevents all endpoint malware
- D) It replaces authorization checks
**Answer:** A
**Explanation:** HTTPS uses TLS to protect communication between client and server.

**CS-060** | Incident Response | Medium
In a practical project, which statement is the most accurate?

Context: Why preserve logs after a security incident?
- A) They prevent every future attack automatically
- B) They can help reconstruct events and support investigation
- C) They replace backups
- D) They always contain no sensitive data
**Answer:** B
**Explanation:** Logs are important evidence when handled securely.

**CS-061** | CIA Triad | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does the CIA triad stand for?
- A) Control, Identity, Access
- B) Cryptography, Intrusion, Authentication
- C) Confidentiality, Integrity, Availability
- D) Central Intelligence Agency
**Answer:** C
**Explanation:** The triad describes core information security goals.

**CS-062** | Passwords | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why use a unique password for each service?
- A) It eliminates phishing
- B) It removes the need for MFA
- C) It makes every password public
- D) A breach at one service is less likely to compromise other accounts
**Answer:** D
**Explanation:** Unique passwords limit credential reuse risk.

**CS-063** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is multi-factor authentication?
- A) Using two or more different categories of verification
- B) Encrypting a public webpage only
- C) Changing a username daily
- D) Using the same password twice
**Answer:** A
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-064** | Web Attacks | Medium
In a practical project, which statement is the most accurate?

Context: What is phishing?
- A) A database indexing technique
- B) A deceptive attempt to trick people into revealing data or taking unsafe actions
- C) A software license
- D) A method to compress files
**Answer:** B
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-065** | SQL Injection | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a strong defense against SQL injection?
- A) Longer table names
- B) Increasing screen resolution
- C) Parameterized queries or prepared statements
- D) Hiding the submit button
**Answer:** C
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-066** | XSS | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What occurs in cross-site scripting?
- A) A password hash is generated
- B) A server receives too few requests
- C) A hard drive is physically removed
- D) Attacker-controlled script runs in another user's browser context
**Answer:** D
**Explanation:** XSS injects script into content viewed by users.

**CS-067** | Networking | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does a firewall commonly do?
- A) Allow or block network traffic according to rules
- B) Create strong user passwords automatically
- C) Replace application logging
- D) Guarantee software has no bugs
**Answer:** A
**Explanation:** Firewalls enforce traffic policies.

**CS-068** | Encryption | Medium
In a practical project, which statement is the most accurate?

Context: What is the key difference between hashing and encryption?
- A) Hashing always needs two keys
- B) Encryption is designed to be reversible with a key; hashing is generally one-way
- C) They are identical in all uses
- D) Encryption cannot protect data
**Answer:** B
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-069** | Access Control | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does least privilege mean?
- A) Share accounts for convenience
- B) Give every user admin rights
- C) Give each account only the access required for its work
- D) Disable authentication
**Answer:** C
**Explanation:** Minimal permissions reduce potential damage.

**CS-070** | Incident Response | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a sensible first response to a suspected compromised account?
- A) Ignore it until next month
- B) Publicly post the password
- C) Delete all logs immediately
- D) Follow the incident process to contain access and preserve relevant evidence
**Answer:** D
**Explanation:** Containment and evidence preservation support effective response.

**CS-071** | Passwords | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why use a password manager?
- A) To generate and store strong unique passwords securely
- B) To disable updates
- C) To share all passwords with coworkers
- D) To guarantee a device cannot be infected
**Answer:** A
**Explanation:** A reputable manager supports unique credentials.

**CS-072** | Authentication | Medium
In a practical project, which statement is the most accurate?

Context: Why is MFA useful if a password is stolen?
- A) It prevents every social-engineering attack
- B) The attacker may still lack the additional factor
- C) It makes the password unchangeable
- D) It encrypts all public websites
**Answer:** B
**Explanation:** A second factor adds a barrier beyond the password.

**CS-073** | Web Attacks | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a denial-of-service attack intended to do?
- A) Create a stronger password
- B) Improve the database schema
- C) Make a service unavailable to legitimate users
- D) Rotate encryption keys
**Answer:** C
**Explanation:** DoS attacks exhaust resources or disrupt service.

**CS-074** | Encryption | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why should sensitive traffic use HTTPS?
- A) It prevents all endpoint malware
- B) It replaces authorization checks
- C) It hides all bugs from developers
- D) TLS protects traffic confidentiality and integrity in transit and authenticates the server
**Answer:** D
**Explanation:** HTTPS uses TLS to protect communication between client and server.

**CS-075** | Incident Response | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why preserve logs after a security incident?
- A) They can help reconstruct events and support investigation
- B) They always contain no sensitive data
- C) They prevent every future attack automatically
- D) They replace backups
**Answer:** A
**Explanation:** Logs are important evidence when handled securely.

**CS-076** | CIA Triad | Medium
In a practical project, which statement is the most accurate?

Context: What does the CIA triad stand for?
- A) Cryptography, Intrusion, Authentication
- B) Confidentiality, Integrity, Availability
- C) Control, Identity, Access
- D) Central Intelligence Agency
**Answer:** B
**Explanation:** The triad describes core information security goals.

**CS-077** | Passwords | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why use a unique password for each service?
- A) It removes the need for MFA
- B) It makes every password public
- C) A breach at one service is less likely to compromise other accounts
- D) It eliminates phishing
**Answer:** C
**Explanation:** Unique passwords limit credential reuse risk.

**CS-078** | Authentication | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is multi-factor authentication?
- A) Using the same password twice
- B) Changing a username daily
- C) Encrypting a public webpage only
- D) Using two or more different categories of verification
**Answer:** D
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-079** | Web Attacks | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is phishing?
- A) A deceptive attempt to trick people into revealing data or taking unsafe actions
- B) A software license
- C) A method to compress files
- D) A database indexing technique
**Answer:** A
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-080** | SQL Injection | Medium
In a practical project, which statement is the most accurate?

Context: What is a strong defense against SQL injection?
- A) Increasing screen resolution
- B) Parameterized queries or prepared statements
- C) Hiding the submit button
- D) Longer table names
**Answer:** B
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-081** | XSS | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What occurs in cross-site scripting?
- A) A password hash is generated
- B) A server receives too few requests
- C) Attacker-controlled script runs in another user's browser context
- D) A hard drive is physically removed
**Answer:** C
**Explanation:** XSS injects script into content viewed by users.

**CS-082** | Networking | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a firewall commonly do?
- A) Create strong user passwords automatically
- B) Guarantee software has no bugs
- C) Replace application logging
- D) Allow or block network traffic according to rules
**Answer:** D
**Explanation:** Firewalls enforce traffic policies.

**CS-083** | Encryption | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the key difference between hashing and encryption?
- A) Encryption is designed to be reversible with a key; hashing is generally one-way
- B) They are identical in all uses
- C) Hashing always needs two keys
- D) Encryption cannot protect data
**Answer:** A
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-084** | Access Control | Medium
In a practical project, which statement is the most accurate?

Context: What does least privilege mean?
- A) Give every user admin rights
- B) Give each account only the access required for its work
- C) Disable authentication
- D) Share accounts for convenience
**Answer:** B
**Explanation:** Minimal permissions reduce potential damage.

**CS-085** | Incident Response | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a sensible first response to a suspected compromised account?
- A) Ignore it until next month
- B) Delete all logs immediately
- C) Follow the incident process to contain access and preserve relevant evidence
- D) Publicly post the password
**Answer:** C
**Explanation:** Containment and evidence preservation support effective response.

**CS-086** | Passwords | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why use a password manager?
- A) To disable updates
- B) To share all passwords with coworkers
- C) To guarantee a device cannot be infected
- D) To generate and store strong unique passwords securely
**Answer:** D
**Explanation:** A reputable manager supports unique credentials.

**CS-087** | Authentication | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why is MFA useful if a password is stolen?
- A) The attacker may still lack the additional factor
- B) It prevents every social-engineering attack
- C) It encrypts all public websites
- D) It makes the password unchangeable
**Answer:** A
**Explanation:** A second factor adds a barrier beyond the password.

**CS-088** | Web Attacks | Medium
In a practical project, which statement is the most accurate?

Context: What is a denial-of-service attack intended to do?
- A) Improve the database schema
- B) Make a service unavailable to legitimate users
- C) Create a stronger password
- D) Rotate encryption keys
**Answer:** B
**Explanation:** DoS attacks exhaust resources or disrupt service.

**CS-089** | Encryption | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why should sensitive traffic use HTTPS?
- A) It prevents all endpoint malware
- B) It replaces authorization checks
- C) TLS protects traffic confidentiality and integrity in transit and authenticates the server
- D) It hides all bugs from developers
**Answer:** C
**Explanation:** HTTPS uses TLS to protect communication between client and server.

**CS-090** | Incident Response | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why preserve logs after a security incident?
- A) They always contain no sensitive data
- B) They prevent every future attack automatically
- C) They replace backups
- D) They can help reconstruct events and support investigation
**Answer:** D
**Explanation:** Logs are important evidence when handled securely.

**CS-091** | CIA Triad | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does the CIA triad stand for?
- A) Confidentiality, Integrity, Availability
- B) Central Intelligence Agency
- C) Cryptography, Intrusion, Authentication
- D) Control, Identity, Access
**Answer:** A
**Explanation:** The triad describes core information security goals.

**CS-092** | Passwords | Medium
In a practical project, which statement is the most accurate?

Context: Why use a unique password for each service?
- A) It makes every password public
- B) A breach at one service is less likely to compromise other accounts
- C) It removes the need for MFA
- D) It eliminates phishing
**Answer:** B
**Explanation:** Unique passwords limit credential reuse risk.

**CS-093** | Authentication | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is multi-factor authentication?
- A) Using the same password twice
- B) Changing a username daily
- C) Using two or more different categories of verification
- D) Encrypting a public webpage only
**Answer:** C
**Explanation:** Factors commonly include knowledge, possession, or inherence.

**CS-094** | Web Attacks | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is phishing?
- A) A database indexing technique
- B) A method to compress files
- C) A software license
- D) A deceptive attempt to trick people into revealing data or taking unsafe actions
**Answer:** D
**Explanation:** Phishing commonly impersonates a trusted source.

**CS-095** | SQL Injection | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a strong defense against SQL injection?
- A) Parameterized queries or prepared statements
- B) Hiding the submit button
- C) Increasing screen resolution
- D) Longer table names
**Answer:** A
**Explanation:** Parameters keep user data separate from SQL syntax.

**CS-096** | XSS | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What occurs in cross-site scripting?
- A) A password hash is generated
- B) Attacker-controlled script runs in another user's browser context
- C) A hard drive is physically removed
- D) A server receives too few requests
**Answer:** B
**Explanation:** XSS injects script into content viewed by users.

**CS-097** | Networking | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: What does a firewall commonly do?
- A) Guarantee software has no bugs
- B) Replace application logging
- C) Allow or block network traffic according to rules
- D) Create strong user passwords automatically
**Answer:** C
**Explanation:** Firewalls enforce traffic policies.

**CS-098** | Encryption | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: What is the key difference between hashing and encryption?
- A) Hashing always needs two keys
- B) Encryption cannot protect data
- C) They are identical in all uses
- D) Encryption is designed to be reversible with a key; hashing is generally one-way
**Answer:** D
**Explanation:** Encryption supports recovery with the appropriate key; hashes do not.

**CS-099** | Access Control | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: What does least privilege mean?
- A) Give each account only the access required for its work
- B) Give every user admin rights
- C) Disable authentication
- D) Share accounts for convenience
**Answer:** A
**Explanation:** Minimal permissions reduce potential damage.

**CS-100** | Incident Response | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What is a sensible first response to a suspected compromised account?
- A) Delete all logs immediately
- B) Follow the incident process to contain access and preserve relevant evidence
- C) Ignore it until next month
- D) Publicly post the password
**Answer:** B
**Explanation:** Containment and evidence preservation support effective response.


# DM — Digital Marketing

**DM-001** | SEO | Basic
What does SEO stand for?
- A) Site Experience Operation
- B) Search Engine Optimization
- C) Secure Email Outreach
- D) Social Engagement Overview
**Answer:** B
**Explanation:** SEO improves a site's visibility in organic search.

**DM-002** | Content | Basic
What is a content calendar used for?
- A) Store user passwords
- B) Automatically guarantee viral reach
- C) Plan topics, formats, owners, and publishing dates
- D) Replace analytics
**Answer:** C
**Explanation:** A calendar coordinates consistent content production.

**DM-003** | Analytics | Basic
How is click-through rate commonly calculated?
- A) Revenue divided by followers
- B) Impressions divided by clicks, multiplied by 100
- C) Conversions divided by budget
- D) Clicks divided by impressions, multiplied by 100
**Answer:** D
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-004** | Paid Ads | Basic
What is a campaign conversion?
- A) A desired action such as a purchase or signup
- B) A keyword's spelling
- C) A page color change
- D) An ad impression only
**Answer:** A
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-005** | Social Media | Basic
What is engagement rate intended to measure?
- A) The number of database tables
- B) Interactions relative to an audience or reach basis
- C) The font size of a post
- D) The website's server uptime
**Answer:** B
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-006** | Email | Basic
What is a subject line's main role?
- A) Guarantee delivery
- B) Encrypt the email automatically
- C) Help recipients understand the email and decide whether to open it
- D) Replace unsubscribe controls
**Answer:** C
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-007** | Conversion | Basic
What is A/B testing?
- A) Publishing the same post twice without measurement
- B) Buying two domains
- C) Changing every campaign setting at once
- D) Comparing two variants under a defined test to assess performance
**Answer:** D
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-008** | Audience | Basic
What is audience segmentation?
- A) Grouping people by relevant characteristics or behavior
- B) Deleting inactive analytics
- C) Using one ad for every goal
- D) Sending every message to everyone
**Answer:** A
**Explanation:** Segmentation supports more relevant messaging.

**DM-009** | Campaigns | Basic
What should be defined before launching a campaign?
- A) Only the color of the logo
- B) Goal, target audience, budget, message, and success metrics
- C) A random posting time
- D) The number of office chairs
**Answer:** B
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-010** | Reporting | Basic
If ad spend rises but conversions stay flat, what should be checked?
- A) The website's footer punctuation
- B) Only the logo dimensions
- C) Cost per conversion, targeting, landing page, and tracking quality
- D) The number of employees' birthdays
**Answer:** C
**Explanation:** These factors help explain why extra spend is not producing more outcomes.

**DM-011** | SEO | Basic
Why is descriptive page title text useful?
- A) It hides the page from indexing
- B) It replaces page content
- C) It guarantees first place in search
- D) It helps users and search engines understand the page topic
**Answer:** D
**Explanation:** Relevant titles communicate page purpose but do not guarantee rankings.

**DM-012** | Analytics | Basic
What does conversion rate commonly measure?
- A) Conversions divided by a relevant number of visits or clicks
- B) Spend divided by office size
- C) Total followers multiplied by font size
- D) Impressions minus page titles
**Answer:** A
**Explanation:** The denominator should match the conversion funnel being analyzed.

**DM-013** | Paid Ads | Basic
What is remarketing intended to do?
- A) Only reach people who have never seen the brand
- B) Reach people who previously interacted with a business or site
- C) Replace product quality
- D) Improve organic rankings directly
**Answer:** B
**Explanation:** Remarketing reconnects with prior visitors or audiences.

**DM-014** | Email | Basic
Why include an unsubscribe option in marketing emails?
- A) Guarantee every message enters the inbox
- B) Hide the sender identity
- C) Respect recipient choice and comply with applicable rules
- D) Increase email size
**Answer:** C
**Explanation:** Recipients should be able to stop marketing messages.

**DM-015** | Reporting | Basic
Why add tracking parameters to campaign links?
- A) Replace consent requirements
- B) Make URLs impossible to open
- C) Improve image resolution
- D) Help attribute visits and outcomes to campaign sources
**Answer:** D
**Explanation:** UTM-style parameters help analytics identify campaign traffic.

**DM-016** | SEO | Basic
What does SEO stand for?
- A) Search Engine Optimization
- B) Site Experience Operation
- C) Secure Email Outreach
- D) Social Engagement Overview
**Answer:** A
**Explanation:** SEO improves a site's visibility in organic search.

**DM-017** | Content | Basic
What is a content calendar used for?
- A) Automatically guarantee viral reach
- B) Plan topics, formats, owners, and publishing dates
- C) Replace analytics
- D) Store user passwords
**Answer:** B
**Explanation:** A calendar coordinates consistent content production.

**DM-018** | Analytics | Basic
How is click-through rate commonly calculated?
- A) Conversions divided by budget
- B) Revenue divided by followers
- C) Clicks divided by impressions, multiplied by 100
- D) Impressions divided by clicks, multiplied by 100
**Answer:** C
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-019** | Paid Ads | Basic
What is a campaign conversion?
- A) A page color change
- B) An ad impression only
- C) A keyword's spelling
- D) A desired action such as a purchase or signup
**Answer:** D
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-020** | Social Media | Basic
What is engagement rate intended to measure?
- A) Interactions relative to an audience or reach basis
- B) The website's server uptime
- C) The font size of a post
- D) The number of database tables
**Answer:** A
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-021** | Email | Basic
What is a subject line's main role?
- A) Encrypt the email automatically
- B) Help recipients understand the email and decide whether to open it
- C) Replace unsubscribe controls
- D) Guarantee delivery
**Answer:** B
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-022** | Conversion | Basic
What is A/B testing?
- A) Publishing the same post twice without measurement
- B) Changing every campaign setting at once
- C) Comparing two variants under a defined test to assess performance
- D) Buying two domains
**Answer:** C
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-023** | Audience | Basic
What is audience segmentation?
- A) Sending every message to everyone
- B) Deleting inactive analytics
- C) Using one ad for every goal
- D) Grouping people by relevant characteristics or behavior
**Answer:** D
**Explanation:** Segmentation supports more relevant messaging.

**DM-024** | Campaigns | Basic
What should be defined before launching a campaign?
- A) Goal, target audience, budget, message, and success metrics
- B) The number of office chairs
- C) Only the color of the logo
- D) A random posting time
**Answer:** A
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-025** | Reporting | Basic
If ad spend rises but conversions stay flat, what should be checked?
- A) The website's footer punctuation
- B) Cost per conversion, targeting, landing page, and tracking quality
- C) Only the logo dimensions
- D) The number of employees' birthdays
**Answer:** B
**Explanation:** These factors help explain why extra spend is not producing more outcomes.

**DM-026** | SEO | Basic
Why is descriptive page title text useful?
- A) It guarantees first place in search
- B) It hides the page from indexing
- C) It helps users and search engines understand the page topic
- D) It replaces page content
**Answer:** C
**Explanation:** Relevant titles communicate page purpose but do not guarantee rankings.

**DM-027** | Analytics | Basic
What does conversion rate commonly measure?
- A) Spend divided by office size
- B) Total followers multiplied by font size
- C) Impressions minus page titles
- D) Conversions divided by a relevant number of visits or clicks
**Answer:** D
**Explanation:** The denominator should match the conversion funnel being analyzed.

**DM-028** | Paid Ads | Basic
What is remarketing intended to do?
- A) Reach people who previously interacted with a business or site
- B) Only reach people who have never seen the brand
- C) Replace product quality
- D) Improve organic rankings directly
**Answer:** A
**Explanation:** Remarketing reconnects with prior visitors or audiences.

**DM-029** | Email | Basic
Why include an unsubscribe option in marketing emails?
- A) Guarantee every message enters the inbox
- B) Respect recipient choice and comply with applicable rules
- C) Increase email size
- D) Hide the sender identity
**Answer:** B
**Explanation:** Recipients should be able to stop marketing messages.

**DM-030** | Reporting | Basic
Why add tracking parameters to campaign links?
- A) Make URLs impossible to open
- B) Improve image resolution
- C) Help attribute visits and outcomes to campaign sources
- D) Replace consent requirements
**Answer:** C
**Explanation:** UTM-style parameters help analytics identify campaign traffic.

**DM-031** | SEO | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does SEO stand for?
- A) Site Experience Operation
- B) Social Engagement Overview
- C) Secure Email Outreach
- D) Search Engine Optimization
**Answer:** D
**Explanation:** SEO improves a site's visibility in organic search.

**DM-032** | Content | Medium
In a practical project, which statement is the most accurate?

Context: What is a content calendar used for?
- A) Plan topics, formats, owners, and publishing dates
- B) Replace analytics
- C) Store user passwords
- D) Automatically guarantee viral reach
**Answer:** A
**Explanation:** A calendar coordinates consistent content production.

**DM-033** | Analytics | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: How is click-through rate commonly calculated?
- A) Impressions divided by clicks, multiplied by 100
- B) Clicks divided by impressions, multiplied by 100
- C) Revenue divided by followers
- D) Conversions divided by budget
**Answer:** B
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-034** | Paid Ads | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a campaign conversion?
- A) A page color change
- B) A keyword's spelling
- C) A desired action such as a purchase or signup
- D) An ad impression only
**Answer:** C
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-035** | Social Media | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is engagement rate intended to measure?
- A) The font size of a post
- B) The number of database tables
- C) The website's server uptime
- D) Interactions relative to an audience or reach basis
**Answer:** D
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-036** | Email | Medium
In a practical project, which statement is the most accurate?

Context: What is a subject line's main role?
- A) Help recipients understand the email and decide whether to open it
- B) Guarantee delivery
- C) Replace unsubscribe controls
- D) Encrypt the email automatically
**Answer:** A
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-037** | Conversion | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is A/B testing?
- A) Changing every campaign setting at once
- B) Comparing two variants under a defined test to assess performance
- C) Buying two domains
- D) Publishing the same post twice without measurement
**Answer:** B
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-038** | Audience | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is audience segmentation?
- A) Using one ad for every goal
- B) Sending every message to everyone
- C) Grouping people by relevant characteristics or behavior
- D) Deleting inactive analytics
**Answer:** C
**Explanation:** Segmentation supports more relevant messaging.

**DM-039** | Campaigns | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should be defined before launching a campaign?
- A) The number of office chairs
- B) Only the color of the logo
- C) A random posting time
- D) Goal, target audience, budget, message, and success metrics
**Answer:** D
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-040** | Reporting | Medium
In a practical project, which statement is the most accurate?

Context: If ad spend rises but conversions stay flat, what should be checked?
- A) Cost per conversion, targeting, landing page, and tracking quality
- B) The number of employees' birthdays
- C) Only the logo dimensions
- D) The website's footer punctuation
**Answer:** A
**Explanation:** These factors help explain why extra spend is not producing more outcomes.

**DM-041** | SEO | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why is descriptive page title text useful?
- A) It hides the page from indexing
- B) It helps users and search engines understand the page topic
- C) It replaces page content
- D) It guarantees first place in search
**Answer:** B
**Explanation:** Relevant titles communicate page purpose but do not guarantee rankings.

**DM-042** | Analytics | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does conversion rate commonly measure?
- A) Total followers multiplied by font size
- B) Spend divided by office size
- C) Conversions divided by a relevant number of visits or clicks
- D) Impressions minus page titles
**Answer:** C
**Explanation:** The denominator should match the conversion funnel being analyzed.

**DM-043** | Paid Ads | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is remarketing intended to do?
- A) Improve organic rankings directly
- B) Replace product quality
- C) Only reach people who have never seen the brand
- D) Reach people who previously interacted with a business or site
**Answer:** D
**Explanation:** Remarketing reconnects with prior visitors or audiences.

**DM-044** | Email | Medium
In a practical project, which statement is the most accurate?

Context: Why include an unsubscribe option in marketing emails?
- A) Respect recipient choice and comply with applicable rules
- B) Guarantee every message enters the inbox
- C) Increase email size
- D) Hide the sender identity
**Answer:** A
**Explanation:** Recipients should be able to stop marketing messages.

**DM-045** | Reporting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why add tracking parameters to campaign links?
- A) Make URLs impossible to open
- B) Help attribute visits and outcomes to campaign sources
- C) Improve image resolution
- D) Replace consent requirements
**Answer:** B
**Explanation:** UTM-style parameters help analytics identify campaign traffic.

**DM-046** | SEO | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does SEO stand for?
- A) Site Experience Operation
- B) Social Engagement Overview
- C) Search Engine Optimization
- D) Secure Email Outreach
**Answer:** C
**Explanation:** SEO improves a site's visibility in organic search.

**DM-047** | Content | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a content calendar used for?
- A) Store user passwords
- B) Automatically guarantee viral reach
- C) Replace analytics
- D) Plan topics, formats, owners, and publishing dates
**Answer:** D
**Explanation:** A calendar coordinates consistent content production.

**DM-048** | Analytics | Medium
In a practical project, which statement is the most accurate?

Context: How is click-through rate commonly calculated?
- A) Clicks divided by impressions, multiplied by 100
- B) Revenue divided by followers
- C) Conversions divided by budget
- D) Impressions divided by clicks, multiplied by 100
**Answer:** A
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-049** | Paid Ads | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a campaign conversion?
- A) A keyword's spelling
- B) A desired action such as a purchase or signup
- C) An ad impression only
- D) A page color change
**Answer:** B
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-050** | Social Media | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is engagement rate intended to measure?
- A) The website's server uptime
- B) The font size of a post
- C) Interactions relative to an audience or reach basis
- D) The number of database tables
**Answer:** C
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-051** | Email | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a subject line's main role?
- A) Replace unsubscribe controls
- B) Encrypt the email automatically
- C) Guarantee delivery
- D) Help recipients understand the email and decide whether to open it
**Answer:** D
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-052** | Conversion | Medium
In a practical project, which statement is the most accurate?

Context: What is A/B testing?
- A) Comparing two variants under a defined test to assess performance
- B) Publishing the same post twice without measurement
- C) Buying two domains
- D) Changing every campaign setting at once
**Answer:** A
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-053** | Audience | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is audience segmentation?
- A) Using one ad for every goal
- B) Grouping people by relevant characteristics or behavior
- C) Deleting inactive analytics
- D) Sending every message to everyone
**Answer:** B
**Explanation:** Segmentation supports more relevant messaging.

**DM-054** | Campaigns | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What should be defined before launching a campaign?
- A) A random posting time
- B) Only the color of the logo
- C) Goal, target audience, budget, message, and success metrics
- D) The number of office chairs
**Answer:** C
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-055** | Reporting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: If ad spend rises but conversions stay flat, what should be checked?
- A) The website's footer punctuation
- B) Only the logo dimensions
- C) The number of employees' birthdays
- D) Cost per conversion, targeting, landing page, and tracking quality
**Answer:** D
**Explanation:** These factors help explain why extra spend is not producing more outcomes.

**DM-056** | SEO | Medium
In a practical project, which statement is the most accurate?

Context: Why is descriptive page title text useful?
- A) It helps users and search engines understand the page topic
- B) It guarantees first place in search
- C) It replaces page content
- D) It hides the page from indexing
**Answer:** A
**Explanation:** Relevant titles communicate page purpose but do not guarantee rankings.

**DM-057** | Analytics | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does conversion rate commonly measure?
- A) Impressions minus page titles
- B) Conversions divided by a relevant number of visits or clicks
- C) Total followers multiplied by font size
- D) Spend divided by office size
**Answer:** B
**Explanation:** The denominator should match the conversion funnel being analyzed.

**DM-058** | Paid Ads | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is remarketing intended to do?
- A) Improve organic rankings directly
- B) Replace product quality
- C) Reach people who previously interacted with a business or site
- D) Only reach people who have never seen the brand
**Answer:** C
**Explanation:** Remarketing reconnects with prior visitors or audiences.

**DM-059** | Email | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why include an unsubscribe option in marketing emails?
- A) Increase email size
- B) Hide the sender identity
- C) Guarantee every message enters the inbox
- D) Respect recipient choice and comply with applicable rules
**Answer:** D
**Explanation:** Recipients should be able to stop marketing messages.

**DM-060** | Reporting | Medium
In a practical project, which statement is the most accurate?

Context: Why add tracking parameters to campaign links?
- A) Help attribute visits and outcomes to campaign sources
- B) Improve image resolution
- C) Replace consent requirements
- D) Make URLs impossible to open
**Answer:** A
**Explanation:** UTM-style parameters help analytics identify campaign traffic.

**DM-061** | SEO | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does SEO stand for?
- A) Social Engagement Overview
- B) Search Engine Optimization
- C) Secure Email Outreach
- D) Site Experience Operation
**Answer:** B
**Explanation:** SEO improves a site's visibility in organic search.

**DM-062** | Content | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a content calendar used for?
- A) Replace analytics
- B) Store user passwords
- C) Plan topics, formats, owners, and publishing dates
- D) Automatically guarantee viral reach
**Answer:** C
**Explanation:** A calendar coordinates consistent content production.

**DM-063** | Analytics | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: How is click-through rate commonly calculated?
- A) Impressions divided by clicks, multiplied by 100
- B) Revenue divided by followers
- C) Conversions divided by budget
- D) Clicks divided by impressions, multiplied by 100
**Answer:** D
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-064** | Paid Ads | Medium
In a practical project, which statement is the most accurate?

Context: What is a campaign conversion?
- A) A desired action such as a purchase or signup
- B) An ad impression only
- C) A page color change
- D) A keyword's spelling
**Answer:** A
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-065** | Social Media | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is engagement rate intended to measure?
- A) The number of database tables
- B) Interactions relative to an audience or reach basis
- C) The font size of a post
- D) The website's server uptime
**Answer:** B
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-066** | Email | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a subject line's main role?
- A) Guarantee delivery
- B) Replace unsubscribe controls
- C) Help recipients understand the email and decide whether to open it
- D) Encrypt the email automatically
**Answer:** C
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-067** | Conversion | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is A/B testing?
- A) Buying two domains
- B) Changing every campaign setting at once
- C) Publishing the same post twice without measurement
- D) Comparing two variants under a defined test to assess performance
**Answer:** D
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-068** | Audience | Medium
In a practical project, which statement is the most accurate?

Context: What is audience segmentation?
- A) Grouping people by relevant characteristics or behavior
- B) Using one ad for every goal
- C) Deleting inactive analytics
- D) Sending every message to everyone
**Answer:** A
**Explanation:** Segmentation supports more relevant messaging.

**DM-069** | Campaigns | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What should be defined before launching a campaign?
- A) Only the color of the logo
- B) Goal, target audience, budget, message, and success metrics
- C) The number of office chairs
- D) A random posting time
**Answer:** B
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-070** | Reporting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: If ad spend rises but conversions stay flat, what should be checked?
- A) The website's footer punctuation
- B) Only the logo dimensions
- C) Cost per conversion, targeting, landing page, and tracking quality
- D) The number of employees' birthdays
**Answer:** C
**Explanation:** These factors help explain why extra spend is not producing more outcomes.

**DM-071** | SEO | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why is descriptive page title text useful?
- A) It hides the page from indexing
- B) It guarantees first place in search
- C) It replaces page content
- D) It helps users and search engines understand the page topic
**Answer:** D
**Explanation:** Relevant titles communicate page purpose but do not guarantee rankings.

**DM-072** | Analytics | Medium
In a practical project, which statement is the most accurate?

Context: What does conversion rate commonly measure?
- A) Conversions divided by a relevant number of visits or clicks
- B) Total followers multiplied by font size
- C) Impressions minus page titles
- D) Spend divided by office size
**Answer:** A
**Explanation:** The denominator should match the conversion funnel being analyzed.

**DM-073** | Paid Ads | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is remarketing intended to do?
- A) Only reach people who have never seen the brand
- B) Reach people who previously interacted with a business or site
- C) Improve organic rankings directly
- D) Replace product quality
**Answer:** B
**Explanation:** Remarketing reconnects with prior visitors or audiences.

**DM-074** | Email | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why include an unsubscribe option in marketing emails?
- A) Guarantee every message enters the inbox
- B) Increase email size
- C) Respect recipient choice and comply with applicable rules
- D) Hide the sender identity
**Answer:** C
**Explanation:** Recipients should be able to stop marketing messages.

**DM-075** | Reporting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why add tracking parameters to campaign links?
- A) Improve image resolution
- B) Make URLs impossible to open
- C) Replace consent requirements
- D) Help attribute visits and outcomes to campaign sources
**Answer:** D
**Explanation:** UTM-style parameters help analytics identify campaign traffic.

**DM-076** | SEO | Medium
In a practical project, which statement is the most accurate?

Context: What does SEO stand for?
- A) Search Engine Optimization
- B) Secure Email Outreach
- C) Site Experience Operation
- D) Social Engagement Overview
**Answer:** A
**Explanation:** SEO improves a site's visibility in organic search.

**DM-077** | Content | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a content calendar used for?
- A) Store user passwords
- B) Plan topics, formats, owners, and publishing dates
- C) Replace analytics
- D) Automatically guarantee viral reach
**Answer:** B
**Explanation:** A calendar coordinates consistent content production.

**DM-078** | Analytics | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: How is click-through rate commonly calculated?
- A) Impressions divided by clicks, multiplied by 100
- B) Conversions divided by budget
- C) Clicks divided by impressions, multiplied by 100
- D) Revenue divided by followers
**Answer:** C
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-079** | Paid Ads | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a campaign conversion?
- A) An ad impression only
- B) A page color change
- C) A keyword's spelling
- D) A desired action such as a purchase or signup
**Answer:** D
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-080** | Social Media | Medium
In a practical project, which statement is the most accurate?

Context: What is engagement rate intended to measure?
- A) Interactions relative to an audience or reach basis
- B) The website's server uptime
- C) The number of database tables
- D) The font size of a post
**Answer:** A
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-081** | Email | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a subject line's main role?
- A) Guarantee delivery
- B) Help recipients understand the email and decide whether to open it
- C) Replace unsubscribe controls
- D) Encrypt the email automatically
**Answer:** B
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-082** | Conversion | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is A/B testing?
- A) Publishing the same post twice without measurement
- B) Changing every campaign setting at once
- C) Comparing two variants under a defined test to assess performance
- D) Buying two domains
**Answer:** C
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-083** | Audience | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is audience segmentation?
- A) Deleting inactive analytics
- B) Sending every message to everyone
- C) Using one ad for every goal
- D) Grouping people by relevant characteristics or behavior
**Answer:** D
**Explanation:** Segmentation supports more relevant messaging.

**DM-084** | Campaigns | Medium
In a practical project, which statement is the most accurate?

Context: What should be defined before launching a campaign?
- A) Goal, target audience, budget, message, and success metrics
- B) Only the color of the logo
- C) A random posting time
- D) The number of office chairs
**Answer:** A
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-085** | Reporting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: If ad spend rises but conversions stay flat, what should be checked?
- A) The website's footer punctuation
- B) Cost per conversion, targeting, landing page, and tracking quality
- C) The number of employees' birthdays
- D) Only the logo dimensions
**Answer:** B
**Explanation:** These factors help explain why extra spend is not producing more outcomes.

**DM-086** | SEO | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why is descriptive page title text useful?
- A) It hides the page from indexing
- B) It guarantees first place in search
- C) It helps users and search engines understand the page topic
- D) It replaces page content
**Answer:** C
**Explanation:** Relevant titles communicate page purpose but do not guarantee rankings.

**DM-087** | Analytics | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does conversion rate commonly measure?
- A) Impressions minus page titles
- B) Total followers multiplied by font size
- C) Spend divided by office size
- D) Conversions divided by a relevant number of visits or clicks
**Answer:** D
**Explanation:** The denominator should match the conversion funnel being analyzed.

**DM-088** | Paid Ads | Medium
In a practical project, which statement is the most accurate?

Context: What is remarketing intended to do?
- A) Reach people who previously interacted with a business or site
- B) Improve organic rankings directly
- C) Only reach people who have never seen the brand
- D) Replace product quality
**Answer:** A
**Explanation:** Remarketing reconnects with prior visitors or audiences.

**DM-089** | Email | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why include an unsubscribe option in marketing emails?
- A) Guarantee every message enters the inbox
- B) Respect recipient choice and comply with applicable rules
- C) Hide the sender identity
- D) Increase email size
**Answer:** B
**Explanation:** Recipients should be able to stop marketing messages.

**DM-090** | Reporting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why add tracking parameters to campaign links?
- A) Improve image resolution
- B) Replace consent requirements
- C) Help attribute visits and outcomes to campaign sources
- D) Make URLs impossible to open
**Answer:** C
**Explanation:** UTM-style parameters help analytics identify campaign traffic.

**DM-091** | SEO | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does SEO stand for?
- A) Secure Email Outreach
- B) Social Engagement Overview
- C) Site Experience Operation
- D) Search Engine Optimization
**Answer:** D
**Explanation:** SEO improves a site's visibility in organic search.

**DM-092** | Content | Medium
In a practical project, which statement is the most accurate?

Context: What is a content calendar used for?
- A) Plan topics, formats, owners, and publishing dates
- B) Replace analytics
- C) Store user passwords
- D) Automatically guarantee viral reach
**Answer:** A
**Explanation:** A calendar coordinates consistent content production.

**DM-093** | Analytics | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: How is click-through rate commonly calculated?
- A) Conversions divided by budget
- B) Clicks divided by impressions, multiplied by 100
- C) Revenue divided by followers
- D) Impressions divided by clicks, multiplied by 100
**Answer:** B
**Explanation:** CTR measures the share of impressions that generated clicks.

**DM-094** | Paid Ads | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a campaign conversion?
- A) A keyword's spelling
- B) An ad impression only
- C) A desired action such as a purchase or signup
- D) A page color change
**Answer:** C
**Explanation:** Conversions are outcomes defined by the campaign goal.

**DM-095** | Social Media | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is engagement rate intended to measure?
- A) The website's server uptime
- B) The font size of a post
- C) The number of database tables
- D) Interactions relative to an audience or reach basis
**Answer:** D
**Explanation:** The exact formula varies by platform and chosen denominator.

**DM-096** | Email | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What is a subject line's main role?
- A) Help recipients understand the email and decide whether to open it
- B) Guarantee delivery
- C) Encrypt the email automatically
- D) Replace unsubscribe controls
**Answer:** A
**Explanation:** A relevant subject line sets expectations and can influence opens.

**DM-097** | Conversion | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: What is A/B testing?
- A) Publishing the same post twice without measurement
- B) Comparing two variants under a defined test to assess performance
- C) Changing every campaign setting at once
- D) Buying two domains
**Answer:** B
**Explanation:** A/B tests compare variants while controlling other factors where possible.

**DM-098** | Audience | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: What is audience segmentation?
- A) Sending every message to everyone
- B) Using one ad for every goal
- C) Grouping people by relevant characteristics or behavior
- D) Deleting inactive analytics
**Answer:** C
**Explanation:** Segmentation supports more relevant messaging.

**DM-099** | Campaigns | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: What should be defined before launching a campaign?
- A) A random posting time
- B) The number of office chairs
- C) Only the color of the logo
- D) Goal, target audience, budget, message, and success metrics
**Answer:** D
**Explanation:** Clear objectives and metrics make evaluation possible.

**DM-100** | Reporting | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: If ad spend rises but conversions stay flat, what should be checked?
- A) Cost per conversion, targeting, landing page, and tracking quality
- B) The website's footer punctuation
- C) Only the logo dimensions
- D) The number of employees' birthdays
**Answer:** A
**Explanation:** These factors help explain why extra spend is not producing more outcomes.


# WP — WordPress

**WP-001** | Basics | Basic
Which language is WordPress primarily written in?
- A) Python
- B) PHP
- C) Ruby
- D) Java
**Answer:** B
**Explanation:** WordPress core is primarily built with PHP.

**WP-002** | Posts and Pages | Basic
What is a typical difference between a post and a page?
- A) Posts cannot have text
- B) There is no possible difference
- C) Posts are commonly time-based; pages are often standalone content
- D) Pages cannot contain images
**Answer:** C
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-003** | Themes | Basic
Where are standard WordPress themes stored?
- A) uploads/themes-only
- B) wp-includes/themes
- C) wp-admin/themes
- D) wp-content/themes
**Answer:** D
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-004** | Plugins | Basic
What is a WordPress plugin used for?
- A) Add or extend site functionality
- B) Store every password in plain text
- C) Replace the web server hardware
- D) Guarantee search ranking
**Answer:** A
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-005** | Media | Basic
What helps improve accessibility for meaningful images?
- A) A longer filename only
- B) Useful alternative text
- C) Using a decorative border
- D) Removing image dimensions
**Answer:** B
**Explanation:** Alt text communicates meaningful image content.

**WP-006** | Users | Basic
Which role generally has broad site administration privileges in a standard WordPress site?
- A) Subscriber
- B) Contributor
- C) Administrator
- D) Visitor
**Answer:** C
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-007** | SEO | Basic
Why use clear permalinks?
- A) They guarantee a top ranking
- B) They prevent all spam
- C) They replace metadata
- D) They create understandable, stable URL structures
**Answer:** D
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-008** | Security | Basic
Why keep WordPress core, themes, and plugins updated?
- A) Updates can fix security vulnerabilities and bugs
- B) Old versions are always safer
- C) It eliminates the need for backups
- D) Updates always remove all vulnerabilities
**Answer:** A
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-009** | Performance | Basic
What is a common purpose of page caching?
- A) Disable all images
- B) Serve a stored page response to reduce repeated processing
- C) Make every page unique on each request
- D) Replace database backups
**Answer:** B
**Explanation:** Caching can reduce server work and improve response times.

**WP-010** | Troubleshooting | Basic
A plugin update breaks a site. What is a sensible first step?
- A) Share the admin password publicly
- B) Ignore the outage
- C) Use logs or a safe recovery/staging process to isolate the cause
- D) Delete the whole database immediately
**Answer:** C
**Explanation:** A controlled rollback or isolation process reduces risk.

**WP-011** | Themes | Basic
What is a child theme useful for?
- A) Store payment card numbers
- B) Replace PHP with CSS
- C) Automatically block all spam
- D) Customize a theme while preserving parent-theme files
**Answer:** D
**Explanation:** Child themes help keep customizations separate from parent updates.

**WP-012** | Plugins | Basic
Why avoid installing plugins from untrusted sources?
- A) They may contain insecure or malicious code
- B) They are required by WordPress
- C) They always make sites faster
- D) They cannot access site data
**Answer:** A
**Explanation:** Plugins run with site privileges and need trustworthy provenance.

**WP-013** | Users | Basic
Why assign users only the roles they need?
- A) To remove the login screen
- B) To limit accidental or unauthorized changes
- C) To speed up images
- D) To make every user an administrator
**Answer:** B
**Explanation:** Least privilege reduces risk from compromised or mistaken accounts.

**WP-014** | Security | Basic
What is a good backup practice before a major update?
- A) Assume the host has a backup
- B) Delete old backups first
- C) Create and verify a restorable backup
- D) Copy only the logo
**Answer:** C
**Explanation:** A tested backup offers a recovery path if the update fails.

**WP-015** | Troubleshooting | Basic
A WordPress page shows a 500 error. What should be checked?
- A) Only the page's heading font
- B) The site's social media captions
- C) The visitor's mouse
- D) Server/PHP logs and recent changes
**Answer:** D
**Explanation:** Logs and recent deployments help identify server-side errors.

**WP-016** | Basics | Basic
Which language is WordPress primarily written in?
- A) PHP
- B) Python
- C) Java
- D) Ruby
**Answer:** A
**Explanation:** WordPress core is primarily built with PHP.

**WP-017** | Posts and Pages | Basic
What is a typical difference between a post and a page?
- A) Pages cannot contain images
- B) Posts are commonly time-based; pages are often standalone content
- C) Posts cannot have text
- D) There is no possible difference
**Answer:** B
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-018** | Themes | Basic
Where are standard WordPress themes stored?
- A) wp-admin/themes
- B) uploads/themes-only
- C) wp-content/themes
- D) wp-includes/themes
**Answer:** C
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-019** | Plugins | Basic
What is a WordPress plugin used for?
- A) Store every password in plain text
- B) Guarantee search ranking
- C) Replace the web server hardware
- D) Add or extend site functionality
**Answer:** D
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-020** | Media | Basic
What helps improve accessibility for meaningful images?
- A) Useful alternative text
- B) Removing image dimensions
- C) Using a decorative border
- D) A longer filename only
**Answer:** A
**Explanation:** Alt text communicates meaningful image content.

**WP-021** | Users | Basic
Which role generally has broad site administration privileges in a standard WordPress site?
- A) Contributor
- B) Administrator
- C) Subscriber
- D) Visitor
**Answer:** B
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-022** | SEO | Basic
Why use clear permalinks?
- A) They guarantee a top ranking
- B) They prevent all spam
- C) They create understandable, stable URL structures
- D) They replace metadata
**Answer:** C
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-023** | Security | Basic
Why keep WordPress core, themes, and plugins updated?
- A) Updates always remove all vulnerabilities
- B) It eliminates the need for backups
- C) Old versions are always safer
- D) Updates can fix security vulnerabilities and bugs
**Answer:** D
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-024** | Performance | Basic
What is a common purpose of page caching?
- A) Serve a stored page response to reduce repeated processing
- B) Replace database backups
- C) Make every page unique on each request
- D) Disable all images
**Answer:** A
**Explanation:** Caching can reduce server work and improve response times.

**WP-025** | Troubleshooting | Basic
A plugin update breaks a site. What is a sensible first step?
- A) Ignore the outage
- B) Use logs or a safe recovery/staging process to isolate the cause
- C) Delete the whole database immediately
- D) Share the admin password publicly
**Answer:** B
**Explanation:** A controlled rollback or isolation process reduces risk.

**WP-026** | Themes | Basic
What is a child theme useful for?
- A) Replace PHP with CSS
- B) Automatically block all spam
- C) Customize a theme while preserving parent-theme files
- D) Store payment card numbers
**Answer:** C
**Explanation:** Child themes help keep customizations separate from parent updates.

**WP-027** | Plugins | Basic
Why avoid installing plugins from untrusted sources?
- A) They are required by WordPress
- B) They cannot access site data
- C) They always make sites faster
- D) They may contain insecure or malicious code
**Answer:** D
**Explanation:** Plugins run with site privileges and need trustworthy provenance.

**WP-028** | Users | Basic
Why assign users only the roles they need?
- A) To limit accidental or unauthorized changes
- B) To make every user an administrator
- C) To remove the login screen
- D) To speed up images
**Answer:** A
**Explanation:** Least privilege reduces risk from compromised or mistaken accounts.

**WP-029** | Security | Basic
What is a good backup practice before a major update?
- A) Copy only the logo
- B) Create and verify a restorable backup
- C) Assume the host has a backup
- D) Delete old backups first
**Answer:** B
**Explanation:** A tested backup offers a recovery path if the update fails.

**WP-030** | Troubleshooting | Basic
A WordPress page shows a 500 error. What should be checked?
- A) Only the page's heading font
- B) The visitor's mouse
- C) Server/PHP logs and recent changes
- D) The site's social media captions
**Answer:** C
**Explanation:** Logs and recent deployments help identify server-side errors.

**WP-031** | Basics | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which language is WordPress primarily written in?
- A) Python
- B) Java
- C) Ruby
- D) PHP
**Answer:** D
**Explanation:** WordPress core is primarily built with PHP.

**WP-032** | Posts and Pages | Medium
In a practical project, which statement is the most accurate?

Context: What is a typical difference between a post and a page?
- A) Posts are commonly time-based; pages are often standalone content
- B) There is no possible difference
- C) Pages cannot contain images
- D) Posts cannot have text
**Answer:** A
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-033** | Themes | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Where are standard WordPress themes stored?
- A) wp-admin/themes
- B) wp-content/themes
- C) wp-includes/themes
- D) uploads/themes-only
**Answer:** B
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-034** | Plugins | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a WordPress plugin used for?
- A) Replace the web server hardware
- B) Guarantee search ranking
- C) Add or extend site functionality
- D) Store every password in plain text
**Answer:** C
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-035** | Media | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What helps improve accessibility for meaningful images?
- A) A longer filename only
- B) Removing image dimensions
- C) Using a decorative border
- D) Useful alternative text
**Answer:** D
**Explanation:** Alt text communicates meaningful image content.

**WP-036** | Users | Medium
In a practical project, which statement is the most accurate?

Context: Which role generally has broad site administration privileges in a standard WordPress site?
- A) Administrator
- B) Contributor
- C) Subscriber
- D) Visitor
**Answer:** A
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-037** | SEO | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why use clear permalinks?
- A) They guarantee a top ranking
- B) They create understandable, stable URL structures
- C) They prevent all spam
- D) They replace metadata
**Answer:** B
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-038** | Security | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why keep WordPress core, themes, and plugins updated?
- A) Old versions are always safer
- B) It eliminates the need for backups
- C) Updates can fix security vulnerabilities and bugs
- D) Updates always remove all vulnerabilities
**Answer:** C
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-039** | Performance | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a common purpose of page caching?
- A) Disable all images
- B) Replace database backups
- C) Make every page unique on each request
- D) Serve a stored page response to reduce repeated processing
**Answer:** D
**Explanation:** Caching can reduce server work and improve response times.

**WP-040** | Troubleshooting | Medium
In a practical project, which statement is the most accurate?

Context: A plugin update breaks a site. What is a sensible first step?
- A) Use logs or a safe recovery/staging process to isolate the cause
- B) Delete the whole database immediately
- C) Share the admin password publicly
- D) Ignore the outage
**Answer:** A
**Explanation:** A controlled rollback or isolation process reduces risk.

**WP-041** | Themes | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a child theme useful for?
- A) Automatically block all spam
- B) Customize a theme while preserving parent-theme files
- C) Store payment card numbers
- D) Replace PHP with CSS
**Answer:** B
**Explanation:** Child themes help keep customizations separate from parent updates.

**WP-042** | Plugins | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why avoid installing plugins from untrusted sources?
- A) They always make sites faster
- B) They cannot access site data
- C) They may contain insecure or malicious code
- D) They are required by WordPress
**Answer:** C
**Explanation:** Plugins run with site privileges and need trustworthy provenance.

**WP-043** | Users | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why assign users only the roles they need?
- A) To make every user an administrator
- B) To remove the login screen
- C) To speed up images
- D) To limit accidental or unauthorized changes
**Answer:** D
**Explanation:** Least privilege reduces risk from compromised or mistaken accounts.

**WP-044** | Security | Medium
In a practical project, which statement is the most accurate?

Context: What is a good backup practice before a major update?
- A) Create and verify a restorable backup
- B) Delete old backups first
- C) Assume the host has a backup
- D) Copy only the logo
**Answer:** A
**Explanation:** A tested backup offers a recovery path if the update fails.

**WP-045** | Troubleshooting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A WordPress page shows a 500 error. What should be checked?
- A) Only the page's heading font
- B) Server/PHP logs and recent changes
- C) The site's social media captions
- D) The visitor's mouse
**Answer:** B
**Explanation:** Logs and recent deployments help identify server-side errors.

**WP-046** | Basics | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which language is WordPress primarily written in?
- A) Java
- B) Python
- C) PHP
- D) Ruby
**Answer:** C
**Explanation:** WordPress core is primarily built with PHP.

**WP-047** | Posts and Pages | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a typical difference between a post and a page?
- A) Posts cannot have text
- B) Pages cannot contain images
- C) There is no possible difference
- D) Posts are commonly time-based; pages are often standalone content
**Answer:** D
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-048** | Themes | Medium
In a practical project, which statement is the most accurate?

Context: Where are standard WordPress themes stored?
- A) wp-content/themes
- B) wp-includes/themes
- C) wp-admin/themes
- D) uploads/themes-only
**Answer:** A
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-049** | Plugins | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a WordPress plugin used for?
- A) Replace the web server hardware
- B) Add or extend site functionality
- C) Store every password in plain text
- D) Guarantee search ranking
**Answer:** B
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-050** | Media | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What helps improve accessibility for meaningful images?
- A) Removing image dimensions
- B) Using a decorative border
- C) Useful alternative text
- D) A longer filename only
**Answer:** C
**Explanation:** Alt text communicates meaningful image content.

**WP-051** | Users | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which role generally has broad site administration privileges in a standard WordPress site?
- A) Subscriber
- B) Visitor
- C) Contributor
- D) Administrator
**Answer:** D
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-052** | SEO | Medium
In a practical project, which statement is the most accurate?

Context: Why use clear permalinks?
- A) They create understandable, stable URL structures
- B) They guarantee a top ranking
- C) They prevent all spam
- D) They replace metadata
**Answer:** A
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-053** | Security | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why keep WordPress core, themes, and plugins updated?
- A) It eliminates the need for backups
- B) Updates can fix security vulnerabilities and bugs
- C) Old versions are always safer
- D) Updates always remove all vulnerabilities
**Answer:** B
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-054** | Performance | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a common purpose of page caching?
- A) Disable all images
- B) Make every page unique on each request
- C) Serve a stored page response to reduce repeated processing
- D) Replace database backups
**Answer:** C
**Explanation:** Caching can reduce server work and improve response times.

**WP-055** | Troubleshooting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A plugin update breaks a site. What is a sensible first step?
- A) Delete the whole database immediately
- B) Ignore the outage
- C) Share the admin password publicly
- D) Use logs or a safe recovery/staging process to isolate the cause
**Answer:** D
**Explanation:** A controlled rollback or isolation process reduces risk.

**WP-056** | Themes | Medium
In a practical project, which statement is the most accurate?

Context: What is a child theme useful for?
- A) Customize a theme while preserving parent-theme files
- B) Store payment card numbers
- C) Replace PHP with CSS
- D) Automatically block all spam
**Answer:** A
**Explanation:** Child themes help keep customizations separate from parent updates.

**WP-057** | Plugins | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why avoid installing plugins from untrusted sources?
- A) They cannot access site data
- B) They may contain insecure or malicious code
- C) They are required by WordPress
- D) They always make sites faster
**Answer:** B
**Explanation:** Plugins run with site privileges and need trustworthy provenance.

**WP-058** | Users | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why assign users only the roles they need?
- A) To make every user an administrator
- B) To remove the login screen
- C) To limit accidental or unauthorized changes
- D) To speed up images
**Answer:** C
**Explanation:** Least privilege reduces risk from compromised or mistaken accounts.

**WP-059** | Security | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a good backup practice before a major update?
- A) Delete old backups first
- B) Copy only the logo
- C) Assume the host has a backup
- D) Create and verify a restorable backup
**Answer:** D
**Explanation:** A tested backup offers a recovery path if the update fails.

**WP-060** | Troubleshooting | Medium
In a practical project, which statement is the most accurate?

Context: A WordPress page shows a 500 error. What should be checked?
- A) Server/PHP logs and recent changes
- B) The site's social media captions
- C) The visitor's mouse
- D) Only the page's heading font
**Answer:** A
**Explanation:** Logs and recent deployments help identify server-side errors.

**WP-061** | Basics | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which language is WordPress primarily written in?
- A) Java
- B) PHP
- C) Ruby
- D) Python
**Answer:** B
**Explanation:** WordPress core is primarily built with PHP.

**WP-062** | Posts and Pages | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a typical difference between a post and a page?
- A) Posts cannot have text
- B) There is no possible difference
- C) Posts are commonly time-based; pages are often standalone content
- D) Pages cannot contain images
**Answer:** C
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-063** | Themes | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Where are standard WordPress themes stored?
- A) wp-admin/themes
- B) wp-includes/themes
- C) uploads/themes-only
- D) wp-content/themes
**Answer:** D
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-064** | Plugins | Medium
In a practical project, which statement is the most accurate?

Context: What is a WordPress plugin used for?
- A) Add or extend site functionality
- B) Guarantee search ranking
- C) Replace the web server hardware
- D) Store every password in plain text
**Answer:** A
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-065** | Media | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What helps improve accessibility for meaningful images?
- A) Removing image dimensions
- B) Useful alternative text
- C) A longer filename only
- D) Using a decorative border
**Answer:** B
**Explanation:** Alt text communicates meaningful image content.

**WP-066** | Users | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which role generally has broad site administration privileges in a standard WordPress site?
- A) Visitor
- B) Contributor
- C) Administrator
- D) Subscriber
**Answer:** C
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-067** | SEO | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why use clear permalinks?
- A) They prevent all spam
- B) They replace metadata
- C) They guarantee a top ranking
- D) They create understandable, stable URL structures
**Answer:** D
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-068** | Security | Medium
In a practical project, which statement is the most accurate?

Context: Why keep WordPress core, themes, and plugins updated?
- A) Updates can fix security vulnerabilities and bugs
- B) It eliminates the need for backups
- C) Updates always remove all vulnerabilities
- D) Old versions are always safer
**Answer:** A
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-069** | Performance | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a common purpose of page caching?
- A) Make every page unique on each request
- B) Serve a stored page response to reduce repeated processing
- C) Replace database backups
- D) Disable all images
**Answer:** B
**Explanation:** Caching can reduce server work and improve response times.

**WP-070** | Troubleshooting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: A plugin update breaks a site. What is a sensible first step?
- A) Share the admin password publicly
- B) Delete the whole database immediately
- C) Use logs or a safe recovery/staging process to isolate the cause
- D) Ignore the outage
**Answer:** C
**Explanation:** A controlled rollback or isolation process reduces risk.

**WP-071** | Themes | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a child theme useful for?
- A) Store payment card numbers
- B) Automatically block all spam
- C) Replace PHP with CSS
- D) Customize a theme while preserving parent-theme files
**Answer:** D
**Explanation:** Child themes help keep customizations separate from parent updates.

**WP-072** | Plugins | Medium
In a practical project, which statement is the most accurate?

Context: Why avoid installing plugins from untrusted sources?
- A) They may contain insecure or malicious code
- B) They always make sites faster
- C) They are required by WordPress
- D) They cannot access site data
**Answer:** A
**Explanation:** Plugins run with site privileges and need trustworthy provenance.

**WP-073** | Users | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why assign users only the roles they need?
- A) To speed up images
- B) To limit accidental or unauthorized changes
- C) To remove the login screen
- D) To make every user an administrator
**Answer:** B
**Explanation:** Least privilege reduces risk from compromised or mistaken accounts.

**WP-074** | Security | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a good backup practice before a major update?
- A) Copy only the logo
- B) Delete old backups first
- C) Create and verify a restorable backup
- D) Assume the host has a backup
**Answer:** C
**Explanation:** A tested backup offers a recovery path if the update fails.

**WP-075** | Troubleshooting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A WordPress page shows a 500 error. What should be checked?
- A) The site's social media captions
- B) The visitor's mouse
- C) Only the page's heading font
- D) Server/PHP logs and recent changes
**Answer:** D
**Explanation:** Logs and recent deployments help identify server-side errors.

**WP-076** | Basics | Medium
In a practical project, which statement is the most accurate?

Context: Which language is WordPress primarily written in?
- A) PHP
- B) Python
- C) Ruby
- D) Java
**Answer:** A
**Explanation:** WordPress core is primarily built with PHP.

**WP-077** | Posts and Pages | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a typical difference between a post and a page?
- A) Posts cannot have text
- B) Posts are commonly time-based; pages are often standalone content
- C) There is no possible difference
- D) Pages cannot contain images
**Answer:** B
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-078** | Themes | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Where are standard WordPress themes stored?
- A) wp-includes/themes
- B) uploads/themes-only
- C) wp-content/themes
- D) wp-admin/themes
**Answer:** C
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-079** | Plugins | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a WordPress plugin used for?
- A) Guarantee search ranking
- B) Replace the web server hardware
- C) Store every password in plain text
- D) Add or extend site functionality
**Answer:** D
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-080** | Media | Medium
In a practical project, which statement is the most accurate?

Context: What helps improve accessibility for meaningful images?
- A) Useful alternative text
- B) A longer filename only
- C) Removing image dimensions
- D) Using a decorative border
**Answer:** A
**Explanation:** Alt text communicates meaningful image content.

**WP-081** | Users | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which role generally has broad site administration privileges in a standard WordPress site?
- A) Subscriber
- B) Administrator
- C) Contributor
- D) Visitor
**Answer:** B
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-082** | SEO | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why use clear permalinks?
- A) They guarantee a top ranking
- B) They replace metadata
- C) They create understandable, stable URL structures
- D) They prevent all spam
**Answer:** C
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-083** | Security | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why keep WordPress core, themes, and plugins updated?
- A) It eliminates the need for backups
- B) Updates always remove all vulnerabilities
- C) Old versions are always safer
- D) Updates can fix security vulnerabilities and bugs
**Answer:** D
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-084** | Performance | Medium
In a practical project, which statement is the most accurate?

Context: What is a common purpose of page caching?
- A) Serve a stored page response to reduce repeated processing
- B) Disable all images
- C) Replace database backups
- D) Make every page unique on each request
**Answer:** A
**Explanation:** Caching can reduce server work and improve response times.

**WP-085** | Troubleshooting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A plugin update breaks a site. What is a sensible first step?
- A) Delete the whole database immediately
- B) Use logs or a safe recovery/staging process to isolate the cause
- C) Ignore the outage
- D) Share the admin password publicly
**Answer:** B
**Explanation:** A controlled rollback or isolation process reduces risk.

**WP-086** | Themes | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a child theme useful for?
- A) Automatically block all spam
- B) Replace PHP with CSS
- C) Customize a theme while preserving parent-theme files
- D) Store payment card numbers
**Answer:** C
**Explanation:** Child themes help keep customizations separate from parent updates.

**WP-087** | Plugins | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why avoid installing plugins from untrusted sources?
- A) They cannot access site data
- B) They are required by WordPress
- C) They always make sites faster
- D) They may contain insecure or malicious code
**Answer:** D
**Explanation:** Plugins run with site privileges and need trustworthy provenance.

**WP-088** | Users | Medium
In a practical project, which statement is the most accurate?

Context: Why assign users only the roles they need?
- A) To limit accidental or unauthorized changes
- B) To make every user an administrator
- C) To speed up images
- D) To remove the login screen
**Answer:** A
**Explanation:** Least privilege reduces risk from compromised or mistaken accounts.

**WP-089** | Security | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a good backup practice before a major update?
- A) Assume the host has a backup
- B) Create and verify a restorable backup
- C) Delete old backups first
- D) Copy only the logo
**Answer:** B
**Explanation:** A tested backup offers a recovery path if the update fails.

**WP-090** | Troubleshooting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: A WordPress page shows a 500 error. What should be checked?
- A) The site's social media captions
- B) The visitor's mouse
- C) Server/PHP logs and recent changes
- D) Only the page's heading font
**Answer:** C
**Explanation:** Logs and recent deployments help identify server-side errors.

**WP-091** | Basics | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which language is WordPress primarily written in?
- A) Ruby
- B) Python
- C) Java
- D) PHP
**Answer:** D
**Explanation:** WordPress core is primarily built with PHP.

**WP-092** | Posts and Pages | Medium
In a practical project, which statement is the most accurate?

Context: What is a typical difference between a post and a page?
- A) Posts are commonly time-based; pages are often standalone content
- B) Posts cannot have text
- C) Pages cannot contain images
- D) There is no possible difference
**Answer:** A
**Explanation:** Posts often appear in feeds while pages represent evergreen content.

**WP-093** | Themes | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Where are standard WordPress themes stored?
- A) uploads/themes-only
- B) wp-content/themes
- C) wp-includes/themes
- D) wp-admin/themes
**Answer:** B
**Explanation:** Themes are normally stored in wp-content/themes.

**WP-094** | Plugins | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a WordPress plugin used for?
- A) Replace the web server hardware
- B) Store every password in plain text
- C) Add or extend site functionality
- D) Guarantee search ranking
**Answer:** C
**Explanation:** Plugins add features or integrations to a WordPress site.

**WP-095** | Media | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What helps improve accessibility for meaningful images?
- A) Using a decorative border
- B) Removing image dimensions
- C) A longer filename only
- D) Useful alternative text
**Answer:** D
**Explanation:** Alt text communicates meaningful image content.

**WP-096** | Users | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Which role generally has broad site administration privileges in a standard WordPress site?
- A) Administrator
- B) Visitor
- C) Contributor
- D) Subscriber
**Answer:** A
**Explanation:** The Administrator role has broad management capabilities, subject to site configuration.

**WP-097** | SEO | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: Why use clear permalinks?
- A) They replace metadata
- B) They create understandable, stable URL structures
- C) They guarantee a top ranking
- D) They prevent all spam
**Answer:** B
**Explanation:** Readable URLs can improve usability and maintainability.

**WP-098** | Security | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: Why keep WordPress core, themes, and plugins updated?
- A) Updates always remove all vulnerabilities
- B) It eliminates the need for backups
- C) Updates can fix security vulnerabilities and bugs
- D) Old versions are always safer
**Answer:** C
**Explanation:** Maintained software receives important fixes, though updates should be tested.

**WP-099** | Performance | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: What is a common purpose of page caching?
- A) Replace database backups
- B) Make every page unique on each request
- C) Disable all images
- D) Serve a stored page response to reduce repeated processing
**Answer:** D
**Explanation:** Caching can reduce server work and improve response times.

**WP-100** | Troubleshooting | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: A plugin update breaks a site. What is a sensible first step?
- A) Use logs or a safe recovery/staging process to isolate the cause
- B) Ignore the outage
- C) Share the admin password publicly
- D) Delete the whole database immediately
**Answer:** A
**Explanation:** A controlled rollback or isolation process reduces risk.


# DO — DevOps

**DO-001** | CI/CD | Basic
What does CI stand for in CI/CD?
- A) Container Installation
- B) Cloud Inspection
- C) Continuous Integration
- D) Code Internet
**Answer:** C
**Explanation:** CI encourages frequent integration with automated checks.

**DO-002** | Git | Basic
What does a Git commit represent?
- A) A running Docker container
- B) A network protocol
- C) A production server
- D) A recorded snapshot of repository changes
**Answer:** D
**Explanation:** Commits record project history.

**DO-003** | Docker | Basic
What is the difference between an image and a container?
- A) An image is a template; a container is an instance created from it
- B) They mean exactly the same thing
- C) A container is always a source-code editor
- D) An image is a running process only
**Answer:** A
**Explanation:** Containers run from images.

**DO-004** | Linux | Basic
Which command commonly lists files in a directory?
- A) whoami
- B) ls
- C) mkdir
- D) pwd
**Answer:** B
**Explanation:** ls lists directory entries.

**DO-005** | Networking | Basic
What is a port used for in networking?
- A) Encrypt a file by itself
- B) Store a Git commit
- C) Identify a service endpoint on a host
- D) Replace an IP address
**Answer:** C
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-006** | Cloud | Basic
What is an environment variable often used for?
- A) Guarantee uptime
- B) Store CSS selectors only
- C) Replace source control
- D) Provide configuration to an application at runtime
**Answer:** D
**Explanation:** Environment variables can separate configuration from code.

**DO-007** | Monitoring | Basic
What is the purpose of application logs?
- A) Record events that help diagnose behavior and failures
- B) Store every secret in public
- C) Replace all tests
- D) Guarantee no outages
**Answer:** A
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-008** | Deployment | Basic
Why use a staging environment?
- A) Make all changes public immediately
- B) Test changes in a production-like setup before release
- C) Replace backups
- D) Avoid integration tests
**Answer:** B
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-009** | Secrets | Basic
Where should production API keys generally be stored?
- A) In a public Git repository
- B) In an issue title
- C) In a protected secret store or secure environment configuration
- D) In a frontend bundle
**Answer:** C
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-010** | Reliability | Basic
Why keep a rollback plan for a deployment?
- A) Avoid monitoring
- B) Guarantee no release will fail
- C) Remove audit trails
- D) Restore a known-good version if the release causes problems
**Answer:** D
**Explanation:** Rollback reduces recovery time after a bad release.

**DO-011** | CI/CD | Basic
Why run automated tests in a pipeline?
- A) Catch regressions before changes are released
- B) Replace all code review in every situation
- C) Make deployments slower intentionally
- D) Hide failing builds
**Answer:** A
**Explanation:** Automated checks provide repeatable feedback.

**DO-012** | Git | Basic
What is a branch commonly used for?
- A) Encrypt the repository automatically
- B) Develop changes separately before merging
- C) Replace issue tracking entirely
- D) Run a server process
**Answer:** B
**Explanation:** Branches isolate work and support collaboration.

**DO-013** | Docker | Basic
Which Dockerfile instruction selects the base image?
- A) COPY
- B) CMD
- C) FROM
- D) RUN
**Answer:** C
**Explanation:** FROM establishes the base image for a build stage.

**DO-014** | Linux | Basic
Which command commonly prints the current working directory?
- A) grep
- B) ls
- C) touch
- D) pwd
**Answer:** D
**Explanation:** pwd prints the current directory path.

**DO-015** | Monitoring | Basic
What is an alert threshold used for?
- A) Notify operators when a measured condition crosses a defined limit
- B) Disable metrics
- C) Encrypt logs automatically
- D) Store source code
**Answer:** A
**Explanation:** Thresholds can surface abnormal behavior for investigation.

**DO-016** | CI/CD | Basic
What does CI stand for in CI/CD?
- A) Code Internet
- B) Continuous Integration
- C) Cloud Inspection
- D) Container Installation
**Answer:** B
**Explanation:** CI encourages frequent integration with automated checks.

**DO-017** | Git | Basic
What does a Git commit represent?
- A) A running Docker container
- B) A network protocol
- C) A recorded snapshot of repository changes
- D) A production server
**Answer:** C
**Explanation:** Commits record project history.

**DO-018** | Docker | Basic
What is the difference between an image and a container?
- A) A container is always a source-code editor
- B) They mean exactly the same thing
- C) An image is a running process only
- D) An image is a template; a container is an instance created from it
**Answer:** D
**Explanation:** Containers run from images.

**DO-019** | Linux | Basic
Which command commonly lists files in a directory?
- A) ls
- B) whoami
- C) pwd
- D) mkdir
**Answer:** A
**Explanation:** ls lists directory entries.

**DO-020** | Networking | Basic
What is a port used for in networking?
- A) Store a Git commit
- B) Identify a service endpoint on a host
- C) Encrypt a file by itself
- D) Replace an IP address
**Answer:** B
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-021** | Cloud | Basic
What is an environment variable often used for?
- A) Store CSS selectors only
- B) Replace source control
- C) Provide configuration to an application at runtime
- D) Guarantee uptime
**Answer:** C
**Explanation:** Environment variables can separate configuration from code.

**DO-022** | Monitoring | Basic
What is the purpose of application logs?
- A) Guarantee no outages
- B) Store every secret in public
- C) Replace all tests
- D) Record events that help diagnose behavior and failures
**Answer:** D
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-023** | Deployment | Basic
Why use a staging environment?
- A) Test changes in a production-like setup before release
- B) Replace backups
- C) Avoid integration tests
- D) Make all changes public immediately
**Answer:** A
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-024** | Secrets | Basic
Where should production API keys generally be stored?
- A) In an issue title
- B) In a protected secret store or secure environment configuration
- C) In a frontend bundle
- D) In a public Git repository
**Answer:** B
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-025** | Reliability | Basic
Why keep a rollback plan for a deployment?
- A) Guarantee no release will fail
- B) Remove audit trails
- C) Restore a known-good version if the release causes problems
- D) Avoid monitoring
**Answer:** C
**Explanation:** Rollback reduces recovery time after a bad release.

**DO-026** | CI/CD | Basic
Why run automated tests in a pipeline?
- A) Replace all code review in every situation
- B) Hide failing builds
- C) Make deployments slower intentionally
- D) Catch regressions before changes are released
**Answer:** D
**Explanation:** Automated checks provide repeatable feedback.

**DO-027** | Git | Basic
What is a branch commonly used for?
- A) Develop changes separately before merging
- B) Replace issue tracking entirely
- C) Run a server process
- D) Encrypt the repository automatically
**Answer:** A
**Explanation:** Branches isolate work and support collaboration.

**DO-028** | Docker | Basic
Which Dockerfile instruction selects the base image?
- A) RUN
- B) FROM
- C) COPY
- D) CMD
**Answer:** B
**Explanation:** FROM establishes the base image for a build stage.

**DO-029** | Linux | Basic
Which command commonly prints the current working directory?
- A) grep
- B) touch
- C) pwd
- D) ls
**Answer:** C
**Explanation:** pwd prints the current directory path.

**DO-030** | Monitoring | Basic
What is an alert threshold used for?
- A) Store source code
- B) Encrypt logs automatically
- C) Disable metrics
- D) Notify operators when a measured condition crosses a defined limit
**Answer:** D
**Explanation:** Thresholds can surface abnormal behavior for investigation.

**DO-031** | CI/CD | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does CI stand for in CI/CD?
- A) Continuous Integration
- B) Code Internet
- C) Container Installation
- D) Cloud Inspection
**Answer:** A
**Explanation:** CI encourages frequent integration with automated checks.

**DO-032** | Git | Medium
In a practical project, which statement is the most accurate?

Context: What does a Git commit represent?
- A) A production server
- B) A recorded snapshot of repository changes
- C) A network protocol
- D) A running Docker container
**Answer:** B
**Explanation:** Commits record project history.

**DO-033** | Docker | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the difference between an image and a container?
- A) A container is always a source-code editor
- B) They mean exactly the same thing
- C) An image is a template; a container is an instance created from it
- D) An image is a running process only
**Answer:** C
**Explanation:** Containers run from images.

**DO-034** | Linux | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which command commonly lists files in a directory?
- A) mkdir
- B) whoami
- C) pwd
- D) ls
**Answer:** D
**Explanation:** ls lists directory entries.

**DO-035** | Networking | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a port used for in networking?
- A) Identify a service endpoint on a host
- B) Store a Git commit
- C) Replace an IP address
- D) Encrypt a file by itself
**Answer:** A
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-036** | Cloud | Medium
In a practical project, which statement is the most accurate?

Context: What is an environment variable often used for?
- A) Replace source control
- B) Provide configuration to an application at runtime
- C) Guarantee uptime
- D) Store CSS selectors only
**Answer:** B
**Explanation:** Environment variables can separate configuration from code.

**DO-037** | Monitoring | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the purpose of application logs?
- A) Replace all tests
- B) Store every secret in public
- C) Record events that help diagnose behavior and failures
- D) Guarantee no outages
**Answer:** C
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-038** | Deployment | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why use a staging environment?
- A) Make all changes public immediately
- B) Replace backups
- C) Avoid integration tests
- D) Test changes in a production-like setup before release
**Answer:** D
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-039** | Secrets | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Where should production API keys generally be stored?
- A) In a protected secret store or secure environment configuration
- B) In a frontend bundle
- C) In an issue title
- D) In a public Git repository
**Answer:** A
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-040** | Reliability | Medium
In a practical project, which statement is the most accurate?

Context: Why keep a rollback plan for a deployment?
- A) Guarantee no release will fail
- B) Restore a known-good version if the release causes problems
- C) Avoid monitoring
- D) Remove audit trails
**Answer:** B
**Explanation:** Rollback reduces recovery time after a bad release.

**DO-041** | CI/CD | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why run automated tests in a pipeline?
- A) Replace all code review in every situation
- B) Hide failing builds
- C) Catch regressions before changes are released
- D) Make deployments slower intentionally
**Answer:** C
**Explanation:** Automated checks provide repeatable feedback.

**DO-042** | Git | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a branch commonly used for?
- A) Replace issue tracking entirely
- B) Run a server process
- C) Encrypt the repository automatically
- D) Develop changes separately before merging
**Answer:** D
**Explanation:** Branches isolate work and support collaboration.

**DO-043** | Docker | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which Dockerfile instruction selects the base image?
- A) FROM
- B) CMD
- C) RUN
- D) COPY
**Answer:** A
**Explanation:** FROM establishes the base image for a build stage.

**DO-044** | Linux | Medium
In a practical project, which statement is the most accurate?

Context: Which command commonly prints the current working directory?
- A) grep
- B) pwd
- C) touch
- D) ls
**Answer:** B
**Explanation:** pwd prints the current directory path.

**DO-045** | Monitoring | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is an alert threshold used for?
- A) Store source code
- B) Disable metrics
- C) Notify operators when a measured condition crosses a defined limit
- D) Encrypt logs automatically
**Answer:** C
**Explanation:** Thresholds can surface abnormal behavior for investigation.

**DO-046** | CI/CD | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does CI stand for in CI/CD?
- A) Container Installation
- B) Cloud Inspection
- C) Code Internet
- D) Continuous Integration
**Answer:** D
**Explanation:** CI encourages frequent integration with automated checks.

**DO-047** | Git | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does a Git commit represent?
- A) A recorded snapshot of repository changes
- B) A running Docker container
- C) A production server
- D) A network protocol
**Answer:** A
**Explanation:** Commits record project history.

**DO-048** | Docker | Medium
In a practical project, which statement is the most accurate?

Context: What is the difference between an image and a container?
- A) A container is always a source-code editor
- B) An image is a template; a container is an instance created from it
- C) They mean exactly the same thing
- D) An image is a running process only
**Answer:** B
**Explanation:** Containers run from images.

**DO-049** | Linux | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which command commonly lists files in a directory?
- A) pwd
- B) mkdir
- C) ls
- D) whoami
**Answer:** C
**Explanation:** ls lists directory entries.

**DO-050** | Networking | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a port used for in networking?
- A) Store a Git commit
- B) Replace an IP address
- C) Encrypt a file by itself
- D) Identify a service endpoint on a host
**Answer:** D
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-051** | Cloud | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is an environment variable often used for?
- A) Provide configuration to an application at runtime
- B) Store CSS selectors only
- C) Replace source control
- D) Guarantee uptime
**Answer:** A
**Explanation:** Environment variables can separate configuration from code.

**DO-052** | Monitoring | Medium
In a practical project, which statement is the most accurate?

Context: What is the purpose of application logs?
- A) Guarantee no outages
- B) Record events that help diagnose behavior and failures
- C) Store every secret in public
- D) Replace all tests
**Answer:** B
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-053** | Deployment | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why use a staging environment?
- A) Make all changes public immediately
- B) Replace backups
- C) Test changes in a production-like setup before release
- D) Avoid integration tests
**Answer:** C
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-054** | Secrets | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Where should production API keys generally be stored?
- A) In a public Git repository
- B) In an issue title
- C) In a frontend bundle
- D) In a protected secret store or secure environment configuration
**Answer:** D
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-055** | Reliability | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why keep a rollback plan for a deployment?
- A) Restore a known-good version if the release causes problems
- B) Avoid monitoring
- C) Guarantee no release will fail
- D) Remove audit trails
**Answer:** A
**Explanation:** Rollback reduces recovery time after a bad release.

**DO-056** | CI/CD | Medium
In a practical project, which statement is the most accurate?

Context: Why run automated tests in a pipeline?
- A) Make deployments slower intentionally
- B) Catch regressions before changes are released
- C) Replace all code review in every situation
- D) Hide failing builds
**Answer:** B
**Explanation:** Automated checks provide repeatable feedback.

**DO-057** | Git | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a branch commonly used for?
- A) Run a server process
- B) Encrypt the repository automatically
- C) Develop changes separately before merging
- D) Replace issue tracking entirely
**Answer:** C
**Explanation:** Branches isolate work and support collaboration.

**DO-058** | Docker | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which Dockerfile instruction selects the base image?
- A) CMD
- B) RUN
- C) COPY
- D) FROM
**Answer:** D
**Explanation:** FROM establishes the base image for a build stage.

**DO-059** | Linux | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which command commonly prints the current working directory?
- A) pwd
- B) touch
- C) grep
- D) ls
**Answer:** A
**Explanation:** pwd prints the current directory path.

**DO-060** | Monitoring | Medium
In a practical project, which statement is the most accurate?

Context: What is an alert threshold used for?
- A) Store source code
- B) Notify operators when a measured condition crosses a defined limit
- C) Disable metrics
- D) Encrypt logs automatically
**Answer:** B
**Explanation:** Thresholds can surface abnormal behavior for investigation.

**DO-061** | CI/CD | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does CI stand for in CI/CD?
- A) Cloud Inspection
- B) Code Internet
- C) Continuous Integration
- D) Container Installation
**Answer:** C
**Explanation:** CI encourages frequent integration with automated checks.

**DO-062** | Git | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What does a Git commit represent?
- A) A running Docker container
- B) A network protocol
- C) A production server
- D) A recorded snapshot of repository changes
**Answer:** D
**Explanation:** Commits record project history.

**DO-063** | Docker | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the difference between an image and a container?
- A) An image is a template; a container is an instance created from it
- B) They mean exactly the same thing
- C) A container is always a source-code editor
- D) An image is a running process only
**Answer:** A
**Explanation:** Containers run from images.

**DO-064** | Linux | Medium
In a practical project, which statement is the most accurate?

Context: Which command commonly lists files in a directory?
- A) mkdir
- B) ls
- C) whoami
- D) pwd
**Answer:** B
**Explanation:** ls lists directory entries.

**DO-065** | Networking | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a port used for in networking?
- A) Store a Git commit
- B) Encrypt a file by itself
- C) Identify a service endpoint on a host
- D) Replace an IP address
**Answer:** C
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-066** | Cloud | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is an environment variable often used for?
- A) Guarantee uptime
- B) Store CSS selectors only
- C) Replace source control
- D) Provide configuration to an application at runtime
**Answer:** D
**Explanation:** Environment variables can separate configuration from code.

**DO-067** | Monitoring | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the purpose of application logs?
- A) Record events that help diagnose behavior and failures
- B) Replace all tests
- C) Store every secret in public
- D) Guarantee no outages
**Answer:** A
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-068** | Deployment | Medium
In a practical project, which statement is the most accurate?

Context: Why use a staging environment?
- A) Avoid integration tests
- B) Test changes in a production-like setup before release
- C) Make all changes public immediately
- D) Replace backups
**Answer:** B
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-069** | Secrets | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Where should production API keys generally be stored?
- A) In a public Git repository
- B) In an issue title
- C) In a protected secret store or secure environment configuration
- D) In a frontend bundle
**Answer:** C
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-070** | Reliability | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why keep a rollback plan for a deployment?
- A) Remove audit trails
- B) Guarantee no release will fail
- C) Avoid monitoring
- D) Restore a known-good version if the release causes problems
**Answer:** D
**Explanation:** Rollback reduces recovery time after a bad release.

**DO-071** | CI/CD | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why run automated tests in a pipeline?
- A) Catch regressions before changes are released
- B) Replace all code review in every situation
- C) Hide failing builds
- D) Make deployments slower intentionally
**Answer:** A
**Explanation:** Automated checks provide repeatable feedback.

**DO-072** | Git | Medium
In a practical project, which statement is the most accurate?

Context: What is a branch commonly used for?
- A) Replace issue tracking entirely
- B) Develop changes separately before merging
- C) Run a server process
- D) Encrypt the repository automatically
**Answer:** B
**Explanation:** Branches isolate work and support collaboration.

**DO-073** | Docker | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which Dockerfile instruction selects the base image?
- A) RUN
- B) COPY
- C) FROM
- D) CMD
**Answer:** C
**Explanation:** FROM establishes the base image for a build stage.

**DO-074** | Linux | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which command commonly prints the current working directory?
- A) ls
- B) touch
- C) grep
- D) pwd
**Answer:** D
**Explanation:** pwd prints the current directory path.

**DO-075** | Monitoring | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is an alert threshold used for?
- A) Notify operators when a measured condition crosses a defined limit
- B) Encrypt logs automatically
- C) Disable metrics
- D) Store source code
**Answer:** A
**Explanation:** Thresholds can surface abnormal behavior for investigation.

**DO-076** | CI/CD | Medium
In a practical project, which statement is the most accurate?

Context: What does CI stand for in CI/CD?
- A) Code Internet
- B) Continuous Integration
- C) Container Installation
- D) Cloud Inspection
**Answer:** B
**Explanation:** CI encourages frequent integration with automated checks.

**DO-077** | Git | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What does a Git commit represent?
- A) A network protocol
- B) A production server
- C) A recorded snapshot of repository changes
- D) A running Docker container
**Answer:** C
**Explanation:** Commits record project history.

**DO-078** | Docker | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the difference between an image and a container?
- A) A container is always a source-code editor
- B) They mean exactly the same thing
- C) An image is a running process only
- D) An image is a template; a container is an instance created from it
**Answer:** D
**Explanation:** Containers run from images.

**DO-079** | Linux | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which command commonly lists files in a directory?
- A) ls
- B) whoami
- C) pwd
- D) mkdir
**Answer:** A
**Explanation:** ls lists directory entries.

**DO-080** | Networking | Medium
In a practical project, which statement is the most accurate?

Context: What is a port used for in networking?
- A) Replace an IP address
- B) Identify a service endpoint on a host
- C) Store a Git commit
- D) Encrypt a file by itself
**Answer:** B
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-081** | Cloud | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is an environment variable often used for?
- A) Store CSS selectors only
- B) Replace source control
- C) Provide configuration to an application at runtime
- D) Guarantee uptime
**Answer:** C
**Explanation:** Environment variables can separate configuration from code.

**DO-082** | Monitoring | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the purpose of application logs?
- A) Store every secret in public
- B) Replace all tests
- C) Guarantee no outages
- D) Record events that help diagnose behavior and failures
**Answer:** D
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-083** | Deployment | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why use a staging environment?
- A) Test changes in a production-like setup before release
- B) Make all changes public immediately
- C) Avoid integration tests
- D) Replace backups
**Answer:** A
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-084** | Secrets | Medium
In a practical project, which statement is the most accurate?

Context: Where should production API keys generally be stored?
- A) In a frontend bundle
- B) In a protected secret store or secure environment configuration
- C) In an issue title
- D) In a public Git repository
**Answer:** B
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-085** | Reliability | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why keep a rollback plan for a deployment?
- A) Avoid monitoring
- B) Remove audit trails
- C) Restore a known-good version if the release causes problems
- D) Guarantee no release will fail
**Answer:** C
**Explanation:** Rollback reduces recovery time after a bad release.

**DO-086** | CI/CD | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why run automated tests in a pipeline?
- A) Hide failing builds
- B) Make deployments slower intentionally
- C) Replace all code review in every situation
- D) Catch regressions before changes are released
**Answer:** D
**Explanation:** Automated checks provide repeatable feedback.

**DO-087** | Git | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a branch commonly used for?
- A) Develop changes separately before merging
- B) Replace issue tracking entirely
- C) Encrypt the repository automatically
- D) Run a server process
**Answer:** A
**Explanation:** Branches isolate work and support collaboration.

**DO-088** | Docker | Medium
In a practical project, which statement is the most accurate?

Context: Which Dockerfile instruction selects the base image?
- A) RUN
- B) FROM
- C) COPY
- D) CMD
**Answer:** B
**Explanation:** FROM establishes the base image for a build stage.

**DO-089** | Linux | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which command commonly prints the current working directory?
- A) ls
- B) touch
- C) pwd
- D) grep
**Answer:** C
**Explanation:** pwd prints the current directory path.

**DO-090** | Monitoring | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is an alert threshold used for?
- A) Disable metrics
- B) Encrypt logs automatically
- C) Store source code
- D) Notify operators when a measured condition crosses a defined limit
**Answer:** D
**Explanation:** Thresholds can surface abnormal behavior for investigation.

**DO-091** | CI/CD | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What does CI stand for in CI/CD?
- A) Continuous Integration
- B) Cloud Inspection
- C) Container Installation
- D) Code Internet
**Answer:** A
**Explanation:** CI encourages frequent integration with automated checks.

**DO-092** | Git | Medium
In a practical project, which statement is the most accurate?

Context: What does a Git commit represent?
- A) A production server
- B) A recorded snapshot of repository changes
- C) A network protocol
- D) A running Docker container
**Answer:** B
**Explanation:** Commits record project history.

**DO-093** | Docker | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the difference between an image and a container?
- A) An image is a running process only
- B) A container is always a source-code editor
- C) An image is a template; a container is an instance created from it
- D) They mean exactly the same thing
**Answer:** C
**Explanation:** Containers run from images.

**DO-094** | Linux | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which command commonly lists files in a directory?
- A) mkdir
- B) whoami
- C) pwd
- D) ls
**Answer:** D
**Explanation:** ls lists directory entries.

**DO-095** | Networking | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a port used for in networking?
- A) Identify a service endpoint on a host
- B) Replace an IP address
- C) Store a Git commit
- D) Encrypt a file by itself
**Answer:** A
**Explanation:** Ports distinguish services or processes receiving network traffic.

**DO-096** | Cloud | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: What is an environment variable often used for?
- A) Guarantee uptime
- B) Provide configuration to an application at runtime
- C) Replace source control
- D) Store CSS selectors only
**Answer:** B
**Explanation:** Environment variables can separate configuration from code.

**DO-097** | Monitoring | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: What is the purpose of application logs?
- A) Replace all tests
- B) Guarantee no outages
- C) Record events that help diagnose behavior and failures
- D) Store every secret in public
**Answer:** C
**Explanation:** Logs provide evidence for debugging and operational review.

**DO-098** | Deployment | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: Why use a staging environment?
- A) Avoid integration tests
- B) Make all changes public immediately
- C) Replace backups
- D) Test changes in a production-like setup before release
**Answer:** D
**Explanation:** Staging can reveal configuration or integration issues before production.

**DO-099** | Secrets | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: Where should production API keys generally be stored?
- A) In a protected secret store or secure environment configuration
- B) In an issue title
- C) In a public Git repository
- D) In a frontend bundle
**Answer:** A
**Explanation:** Secrets should not be exposed in source code or client assets.

**DO-100** | Reliability | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Why keep a rollback plan for a deployment?
- A) Remove audit trails
- B) Restore a known-good version if the release causes problems
- C) Avoid monitoring
- D) Guarantee no release will fail
**Answer:** B
**Explanation:** Rollback reduces recovery time after a bad release.


# OF — On-Field Marketing

**OF-001** | Fundamentals | Basic
What is the primary aim of on-field marketing?
- A) Manage payroll
- B) Write software
- C) Engage potential customers face to face and promote offerings
- D) Run only online ads
**Answer:** C
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-002** | Prospecting | Basic
What is prospecting?
- A) Ignoring the target market
- B) Closing every lead immediately
- C) Sending invoices to everyone
- D) Identifying potential customers who may fit the offering
**Answer:** D
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-003** | First Contact | Basic
What is a good way to start a conversation with a prospect?
- A) Introduce yourself briefly and ask a relevant, respectful question
- B) Interrupt repeatedly
- C) Demand a purchase
- D) Immediately list every feature
**Answer:** A
**Explanation:** A respectful opener earns permission to understand needs.

**OF-004** | Needs Discovery | Basic
Why ask questions before pitching?
- A) Make the meeting longer without purpose
- B) Understand the prospect's problem and tailor the discussion
- C) Avoid learning anything about the buyer
- D) Guarantee an instant sale
**Answer:** B
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-005** | Pitching | Basic
What makes a product pitch more relevant?
- A) Avoid examples
- B) Discuss only technical jargon
- C) Connect a specific benefit to a need the prospect expressed
- D) Use the same script regardless of customer
**Answer:** C
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-006** | Objections | Basic
A prospect says the price is too high. What should you do first?
- A) Argue that they are wrong
- B) Offer an unapproved discount immediately
- C) End the conversation angrily
- D) Ask what they are comparing against and explore the concern respectfully
**Answer:** D
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-007** | Lead Qualification | Basic
Why qualify a lead?
- A) Assess fit, need, authority, timing, and likely next steps
- B) Guarantee every lead will buy
- C) Collect unrelated personal information
- D) Avoid recording any details
**Answer:** A
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-008** | Follow-up | Basic
What should a good follow-up message include?
- A) A demand for immediate payment
- B) A brief recap, agreed next step, and relevant timing
- C) An unrelated offer
- D) Repeated messages every hour
**Answer:** B
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-009** | Ethics | Basic
What should a marketer do if they do not know an answer to a customer's question?
- A) Blame the customer
- B) Make a guarantee without approval
- C) Be honest and commit to verifying the information
- D) Invent a feature
**Answer:** C
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-010** | Reporting | Basic
Why record field visits promptly?
- A) Replace customer consent
- B) Increase paperwork without benefit
- C) Guarantee a sale
- D) Keep accurate lead status, customer needs, and follow-up actions
**Answer:** D
**Explanation:** Accurate records support continuity and performance tracking.

**OF-011** | Prospecting | Basic
Which prospect is usually the best initial fit?
- A) A business whose needs align with the product's intended use
- B) A contact with no relevant need
- C) A business that has explicitly opted out
- D) Any person selected at random
**Answer:** A
**Explanation:** Target fit improves the usefulness of outreach.

**OF-012** | Needs Discovery | Basic
A customer describes a problem. What is a useful next step?
- A) Assume the most expensive package fits
- B) Ask a clarifying question and confirm your understanding
- C) Promise results without evidence
- D) Immediately change the subject
**Answer:** B
**Explanation:** Clarification reduces misunderstandings before recommending a solution.

**OF-013** | Objections | Basic
If a prospect says they are not interested, what is appropriate?
- A) Raise your voice
- B) Ignore a clear request to stop
- C) Respect the response and ask permission for one brief clarification if suitable
- D) Keep arguing until they agree
**Answer:** C
**Explanation:** Respectful handling protects the prospect's choice and the brand.

**OF-014** | Lead Qualification | Basic
Which information is most relevant to a business lead record?
- A) Personal passwords
- B) Guessed income
- C) Unrelated private details
- D) Business need, contact permission, role, status, and agreed next step
**Answer:** D
**Explanation:** Records should be relevant, accurate, and handled appropriately.

**OF-015** | Reporting | Basic
Which metric helps evaluate field outreach efficiency?
- A) Qualified leads generated per visit or campaign
- B) Office wall size
- C) The color of the sales uniform only
- D) Number of words in the pitch
**Answer:** A
**Explanation:** Efficiency metrics relate activity to meaningful outcomes.

**OF-016** | Fundamentals | Basic
What is the primary aim of on-field marketing?
- A) Manage payroll
- B) Engage potential customers face to face and promote offerings
- C) Run only online ads
- D) Write software
**Answer:** B
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-017** | Prospecting | Basic
What is prospecting?
- A) Sending invoices to everyone
- B) Ignoring the target market
- C) Identifying potential customers who may fit the offering
- D) Closing every lead immediately
**Answer:** C
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-018** | First Contact | Basic
What is a good way to start a conversation with a prospect?
- A) Demand a purchase
- B) Immediately list every feature
- C) Interrupt repeatedly
- D) Introduce yourself briefly and ask a relevant, respectful question
**Answer:** D
**Explanation:** A respectful opener earns permission to understand needs.

**OF-019** | Needs Discovery | Basic
Why ask questions before pitching?
- A) Understand the prospect's problem and tailor the discussion
- B) Make the meeting longer without purpose
- C) Guarantee an instant sale
- D) Avoid learning anything about the buyer
**Answer:** A
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-020** | Pitching | Basic
What makes a product pitch more relevant?
- A) Discuss only technical jargon
- B) Connect a specific benefit to a need the prospect expressed
- C) Avoid examples
- D) Use the same script regardless of customer
**Answer:** B
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-021** | Objections | Basic
A prospect says the price is too high. What should you do first?
- A) Argue that they are wrong
- B) Offer an unapproved discount immediately
- C) Ask what they are comparing against and explore the concern respectfully
- D) End the conversation angrily
**Answer:** C
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-022** | Lead Qualification | Basic
Why qualify a lead?
- A) Guarantee every lead will buy
- B) Avoid recording any details
- C) Collect unrelated personal information
- D) Assess fit, need, authority, timing, and likely next steps
**Answer:** D
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-023** | Follow-up | Basic
What should a good follow-up message include?
- A) A brief recap, agreed next step, and relevant timing
- B) An unrelated offer
- C) A demand for immediate payment
- D) Repeated messages every hour
**Answer:** A
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-024** | Ethics | Basic
What should a marketer do if they do not know an answer to a customer's question?
- A) Invent a feature
- B) Be honest and commit to verifying the information
- C) Make a guarantee without approval
- D) Blame the customer
**Answer:** B
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-025** | Reporting | Basic
Why record field visits promptly?
- A) Increase paperwork without benefit
- B) Guarantee a sale
- C) Keep accurate lead status, customer needs, and follow-up actions
- D) Replace customer consent
**Answer:** C
**Explanation:** Accurate records support continuity and performance tracking.

**OF-026** | Prospecting | Basic
Which prospect is usually the best initial fit?
- A) A business that has explicitly opted out
- B) A contact with no relevant need
- C) Any person selected at random
- D) A business whose needs align with the product's intended use
**Answer:** D
**Explanation:** Target fit improves the usefulness of outreach.

**OF-027** | Needs Discovery | Basic
A customer describes a problem. What is a useful next step?
- A) Ask a clarifying question and confirm your understanding
- B) Promise results without evidence
- C) Immediately change the subject
- D) Assume the most expensive package fits
**Answer:** A
**Explanation:** Clarification reduces misunderstandings before recommending a solution.

**OF-028** | Objections | Basic
If a prospect says they are not interested, what is appropriate?
- A) Ignore a clear request to stop
- B) Respect the response and ask permission for one brief clarification if suitable
- C) Raise your voice
- D) Keep arguing until they agree
**Answer:** B
**Explanation:** Respectful handling protects the prospect's choice and the brand.

**OF-029** | Lead Qualification | Basic
Which information is most relevant to a business lead record?
- A) Unrelated private details
- B) Guessed income
- C) Business need, contact permission, role, status, and agreed next step
- D) Personal passwords
**Answer:** C
**Explanation:** Records should be relevant, accurate, and handled appropriately.

**OF-030** | Reporting | Basic
Which metric helps evaluate field outreach efficiency?
- A) Number of words in the pitch
- B) The color of the sales uniform only
- C) Office wall size
- D) Qualified leads generated per visit or campaign
**Answer:** D
**Explanation:** Efficiency metrics relate activity to meaningful outcomes.

**OF-031** | Fundamentals | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the primary aim of on-field marketing?
- A) Engage potential customers face to face and promote offerings
- B) Run only online ads
- C) Write software
- D) Manage payroll
**Answer:** A
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-032** | Prospecting | Medium
In a practical project, which statement is the most accurate?

Context: What is prospecting?
- A) Closing every lead immediately
- B) Identifying potential customers who may fit the offering
- C) Ignoring the target market
- D) Sending invoices to everyone
**Answer:** B
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-033** | First Contact | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a good way to start a conversation with a prospect?
- A) Interrupt repeatedly
- B) Demand a purchase
- C) Introduce yourself briefly and ask a relevant, respectful question
- D) Immediately list every feature
**Answer:** C
**Explanation:** A respectful opener earns permission to understand needs.

**OF-034** | Needs Discovery | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why ask questions before pitching?
- A) Avoid learning anything about the buyer
- B) Guarantee an instant sale
- C) Make the meeting longer without purpose
- D) Understand the prospect's problem and tailor the discussion
**Answer:** D
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-035** | Pitching | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What makes a product pitch more relevant?
- A) Connect a specific benefit to a need the prospect expressed
- B) Use the same script regardless of customer
- C) Discuss only technical jargon
- D) Avoid examples
**Answer:** A
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-036** | Objections | Medium
In a practical project, which statement is the most accurate?

Context: A prospect says the price is too high. What should you do first?
- A) End the conversation angrily
- B) Ask what they are comparing against and explore the concern respectfully
- C) Argue that they are wrong
- D) Offer an unapproved discount immediately
**Answer:** B
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-037** | Lead Qualification | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why qualify a lead?
- A) Avoid recording any details
- B) Collect unrelated personal information
- C) Assess fit, need, authority, timing, and likely next steps
- D) Guarantee every lead will buy
**Answer:** C
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-038** | Follow-up | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What should a good follow-up message include?
- A) An unrelated offer
- B) Repeated messages every hour
- C) A demand for immediate payment
- D) A brief recap, agreed next step, and relevant timing
**Answer:** D
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-039** | Ethics | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should a marketer do if they do not know an answer to a customer's question?
- A) Be honest and commit to verifying the information
- B) Invent a feature
- C) Blame the customer
- D) Make a guarantee without approval
**Answer:** A
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-040** | Reporting | Medium
In a practical project, which statement is the most accurate?

Context: Why record field visits promptly?
- A) Increase paperwork without benefit
- B) Keep accurate lead status, customer needs, and follow-up actions
- C) Replace customer consent
- D) Guarantee a sale
**Answer:** B
**Explanation:** Accurate records support continuity and performance tracking.

**OF-041** | Prospecting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which prospect is usually the best initial fit?
- A) Any person selected at random
- B) A contact with no relevant need
- C) A business whose needs align with the product's intended use
- D) A business that has explicitly opted out
**Answer:** C
**Explanation:** Target fit improves the usefulness of outreach.

**OF-042** | Needs Discovery | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: A customer describes a problem. What is a useful next step?
- A) Immediately change the subject
- B) Assume the most expensive package fits
- C) Promise results without evidence
- D) Ask a clarifying question and confirm your understanding
**Answer:** D
**Explanation:** Clarification reduces misunderstandings before recommending a solution.

**OF-043** | Objections | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: If a prospect says they are not interested, what is appropriate?
- A) Respect the response and ask permission for one brief clarification if suitable
- B) Keep arguing until they agree
- C) Ignore a clear request to stop
- D) Raise your voice
**Answer:** A
**Explanation:** Respectful handling protects the prospect's choice and the brand.

**OF-044** | Lead Qualification | Medium
In a practical project, which statement is the most accurate?

Context: Which information is most relevant to a business lead record?
- A) Unrelated private details
- B) Business need, contact permission, role, status, and agreed next step
- C) Guessed income
- D) Personal passwords
**Answer:** B
**Explanation:** Records should be relevant, accurate, and handled appropriately.

**OF-045** | Reporting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which metric helps evaluate field outreach efficiency?
- A) Number of words in the pitch
- B) The color of the sales uniform only
- C) Qualified leads generated per visit or campaign
- D) Office wall size
**Answer:** C
**Explanation:** Efficiency metrics relate activity to meaningful outcomes.

**OF-046** | Fundamentals | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is the primary aim of on-field marketing?
- A) Write software
- B) Manage payroll
- C) Run only online ads
- D) Engage potential customers face to face and promote offerings
**Answer:** D
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-047** | Prospecting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is prospecting?
- A) Identifying potential customers who may fit the offering
- B) Sending invoices to everyone
- C) Closing every lead immediately
- D) Ignoring the target market
**Answer:** A
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-048** | First Contact | Medium
In a practical project, which statement is the most accurate?

Context: What is a good way to start a conversation with a prospect?
- A) Interrupt repeatedly
- B) Introduce yourself briefly and ask a relevant, respectful question
- C) Demand a purchase
- D) Immediately list every feature
**Answer:** B
**Explanation:** A respectful opener earns permission to understand needs.

**OF-049** | Needs Discovery | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why ask questions before pitching?
- A) Avoid learning anything about the buyer
- B) Guarantee an instant sale
- C) Understand the prospect's problem and tailor the discussion
- D) Make the meeting longer without purpose
**Answer:** C
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-050** | Pitching | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What makes a product pitch more relevant?
- A) Avoid examples
- B) Discuss only technical jargon
- C) Use the same script regardless of customer
- D) Connect a specific benefit to a need the prospect expressed
**Answer:** D
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-051** | Objections | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A prospect says the price is too high. What should you do first?
- A) Ask what they are comparing against and explore the concern respectfully
- B) End the conversation angrily
- C) Offer an unapproved discount immediately
- D) Argue that they are wrong
**Answer:** A
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-052** | Lead Qualification | Medium
In a practical project, which statement is the most accurate?

Context: Why qualify a lead?
- A) Avoid recording any details
- B) Assess fit, need, authority, timing, and likely next steps
- C) Guarantee every lead will buy
- D) Collect unrelated personal information
**Answer:** B
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-053** | Follow-up | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What should a good follow-up message include?
- A) Repeated messages every hour
- B) An unrelated offer
- C) A brief recap, agreed next step, and relevant timing
- D) A demand for immediate payment
**Answer:** C
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-054** | Ethics | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What should a marketer do if they do not know an answer to a customer's question?
- A) Blame the customer
- B) Make a guarantee without approval
- C) Invent a feature
- D) Be honest and commit to verifying the information
**Answer:** D
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-055** | Reporting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why record field visits promptly?
- A) Keep accurate lead status, customer needs, and follow-up actions
- B) Guarantee a sale
- C) Replace customer consent
- D) Increase paperwork without benefit
**Answer:** A
**Explanation:** Accurate records support continuity and performance tracking.

**OF-056** | Prospecting | Medium
In a practical project, which statement is the most accurate?

Context: Which prospect is usually the best initial fit?
- A) A business that has explicitly opted out
- B) A business whose needs align with the product's intended use
- C) A contact with no relevant need
- D) Any person selected at random
**Answer:** B
**Explanation:** Target fit improves the usefulness of outreach.

**OF-057** | Needs Discovery | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A customer describes a problem. What is a useful next step?
- A) Assume the most expensive package fits
- B) Immediately change the subject
- C) Ask a clarifying question and confirm your understanding
- D) Promise results without evidence
**Answer:** C
**Explanation:** Clarification reduces misunderstandings before recommending a solution.

**OF-058** | Objections | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: If a prospect says they are not interested, what is appropriate?
- A) Ignore a clear request to stop
- B) Keep arguing until they agree
- C) Raise your voice
- D) Respect the response and ask permission for one brief clarification if suitable
**Answer:** D
**Explanation:** Respectful handling protects the prospect's choice and the brand.

**OF-059** | Lead Qualification | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which information is most relevant to a business lead record?
- A) Business need, contact permission, role, status, and agreed next step
- B) Personal passwords
- C) Guessed income
- D) Unrelated private details
**Answer:** A
**Explanation:** Records should be relevant, accurate, and handled appropriately.

**OF-060** | Reporting | Medium
In a practical project, which statement is the most accurate?

Context: Which metric helps evaluate field outreach efficiency?
- A) The color of the sales uniform only
- B) Qualified leads generated per visit or campaign
- C) Office wall size
- D) Number of words in the pitch
**Answer:** B
**Explanation:** Efficiency metrics relate activity to meaningful outcomes.

**OF-061** | Fundamentals | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is the primary aim of on-field marketing?
- A) Run only online ads
- B) Manage payroll
- C) Engage potential customers face to face and promote offerings
- D) Write software
**Answer:** C
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-062** | Prospecting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is prospecting?
- A) Ignoring the target market
- B) Closing every lead immediately
- C) Sending invoices to everyone
- D) Identifying potential customers who may fit the offering
**Answer:** D
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-063** | First Contact | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is a good way to start a conversation with a prospect?
- A) Introduce yourself briefly and ask a relevant, respectful question
- B) Interrupt repeatedly
- C) Demand a purchase
- D) Immediately list every feature
**Answer:** A
**Explanation:** A respectful opener earns permission to understand needs.

**OF-064** | Needs Discovery | Medium
In a practical project, which statement is the most accurate?

Context: Why ask questions before pitching?
- A) Avoid learning anything about the buyer
- B) Understand the prospect's problem and tailor the discussion
- C) Make the meeting longer without purpose
- D) Guarantee an instant sale
**Answer:** B
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-065** | Pitching | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What makes a product pitch more relevant?
- A) Use the same script regardless of customer
- B) Avoid examples
- C) Connect a specific benefit to a need the prospect expressed
- D) Discuss only technical jargon
**Answer:** C
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-066** | Objections | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: A prospect says the price is too high. What should you do first?
- A) End the conversation angrily
- B) Argue that they are wrong
- C) Offer an unapproved discount immediately
- D) Ask what they are comparing against and explore the concern respectfully
**Answer:** D
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-067** | Lead Qualification | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why qualify a lead?
- A) Assess fit, need, authority, timing, and likely next steps
- B) Guarantee every lead will buy
- C) Collect unrelated personal information
- D) Avoid recording any details
**Answer:** A
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-068** | Follow-up | Medium
In a practical project, which statement is the most accurate?

Context: What should a good follow-up message include?
- A) Repeated messages every hour
- B) A brief recap, agreed next step, and relevant timing
- C) A demand for immediate payment
- D) An unrelated offer
**Answer:** B
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-069** | Ethics | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What should a marketer do if they do not know an answer to a customer's question?
- A) Invent a feature
- B) Blame the customer
- C) Be honest and commit to verifying the information
- D) Make a guarantee without approval
**Answer:** C
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-070** | Reporting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why record field visits promptly?
- A) Guarantee a sale
- B) Increase paperwork without benefit
- C) Replace customer consent
- D) Keep accurate lead status, customer needs, and follow-up actions
**Answer:** D
**Explanation:** Accurate records support continuity and performance tracking.

**OF-071** | Prospecting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which prospect is usually the best initial fit?
- A) A business whose needs align with the product's intended use
- B) Any person selected at random
- C) A business that has explicitly opted out
- D) A contact with no relevant need
**Answer:** A
**Explanation:** Target fit improves the usefulness of outreach.

**OF-072** | Needs Discovery | Medium
In a practical project, which statement is the most accurate?

Context: A customer describes a problem. What is a useful next step?
- A) Immediately change the subject
- B) Ask a clarifying question and confirm your understanding
- C) Assume the most expensive package fits
- D) Promise results without evidence
**Answer:** B
**Explanation:** Clarification reduces misunderstandings before recommending a solution.

**OF-073** | Objections | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: If a prospect says they are not interested, what is appropriate?
- A) Ignore a clear request to stop
- B) Keep arguing until they agree
- C) Respect the response and ask permission for one brief clarification if suitable
- D) Raise your voice
**Answer:** C
**Explanation:** Respectful handling protects the prospect's choice and the brand.

**OF-074** | Lead Qualification | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which information is most relevant to a business lead record?
- A) Unrelated private details
- B) Guessed income
- C) Personal passwords
- D) Business need, contact permission, role, status, and agreed next step
**Answer:** D
**Explanation:** Records should be relevant, accurate, and handled appropriately.

**OF-075** | Reporting | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Which metric helps evaluate field outreach efficiency?
- A) Qualified leads generated per visit or campaign
- B) Number of words in the pitch
- C) Office wall size
- D) The color of the sales uniform only
**Answer:** A
**Explanation:** Efficiency metrics relate activity to meaningful outcomes.

**OF-076** | Fundamentals | Medium
In a practical project, which statement is the most accurate?

Context: What is the primary aim of on-field marketing?
- A) Write software
- B) Engage potential customers face to face and promote offerings
- C) Run only online ads
- D) Manage payroll
**Answer:** B
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-077** | Prospecting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is prospecting?
- A) Ignoring the target market
- B) Closing every lead immediately
- C) Identifying potential customers who may fit the offering
- D) Sending invoices to everyone
**Answer:** C
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-078** | First Contact | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: What is a good way to start a conversation with a prospect?
- A) Demand a purchase
- B) Immediately list every feature
- C) Interrupt repeatedly
- D) Introduce yourself briefly and ask a relevant, respectful question
**Answer:** D
**Explanation:** A respectful opener earns permission to understand needs.

**OF-079** | Needs Discovery | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: Why ask questions before pitching?
- A) Understand the prospect's problem and tailor the discussion
- B) Guarantee an instant sale
- C) Avoid learning anything about the buyer
- D) Make the meeting longer without purpose
**Answer:** A
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-080** | Pitching | Medium
In a practical project, which statement is the most accurate?

Context: What makes a product pitch more relevant?
- A) Discuss only technical jargon
- B) Connect a specific benefit to a need the prospect expressed
- C) Avoid examples
- D) Use the same script regardless of customer
**Answer:** B
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-081** | Objections | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: A prospect says the price is too high. What should you do first?
- A) End the conversation angrily
- B) Argue that they are wrong
- C) Ask what they are comparing against and explore the concern respectfully
- D) Offer an unapproved discount immediately
**Answer:** C
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-082** | Lead Qualification | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why qualify a lead?
- A) Guarantee every lead will buy
- B) Avoid recording any details
- C) Collect unrelated personal information
- D) Assess fit, need, authority, timing, and likely next steps
**Answer:** D
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-083** | Follow-up | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What should a good follow-up message include?
- A) A brief recap, agreed next step, and relevant timing
- B) An unrelated offer
- C) Repeated messages every hour
- D) A demand for immediate payment
**Answer:** A
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-084** | Ethics | Medium
In a practical project, which statement is the most accurate?

Context: What should a marketer do if they do not know an answer to a customer's question?
- A) Blame the customer
- B) Be honest and commit to verifying the information
- C) Invent a feature
- D) Make a guarantee without approval
**Answer:** B
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-085** | Reporting | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Why record field visits promptly?
- A) Increase paperwork without benefit
- B) Replace customer consent
- C) Keep accurate lead status, customer needs, and follow-up actions
- D) Guarantee a sale
**Answer:** C
**Explanation:** Accurate records support continuity and performance tracking.

**OF-086** | Prospecting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which prospect is usually the best initial fit?
- A) A business that has explicitly opted out
- B) A contact with no relevant need
- C) Any person selected at random
- D) A business whose needs align with the product's intended use
**Answer:** D
**Explanation:** Target fit improves the usefulness of outreach.

**OF-087** | Needs Discovery | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: A customer describes a problem. What is a useful next step?
- A) Ask a clarifying question and confirm your understanding
- B) Assume the most expensive package fits
- C) Promise results without evidence
- D) Immediately change the subject
**Answer:** A
**Explanation:** Clarification reduces misunderstandings before recommending a solution.

**OF-088** | Objections | Medium
In a practical project, which statement is the most accurate?

Context: If a prospect says they are not interested, what is appropriate?
- A) Keep arguing until they agree
- B) Respect the response and ask permission for one brief clarification if suitable
- C) Raise your voice
- D) Ignore a clear request to stop
**Answer:** B
**Explanation:** Respectful handling protects the prospect's choice and the brand.

**OF-089** | Lead Qualification | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: Which information is most relevant to a business lead record?
- A) Guessed income
- B) Unrelated private details
- C) Business need, contact permission, role, status, and agreed next step
- D) Personal passwords
**Answer:** C
**Explanation:** Records should be relevant, accurate, and handled appropriately.

**OF-090** | Reporting | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Which metric helps evaluate field outreach efficiency?
- A) Office wall size
- B) Number of words in the pitch
- C) The color of the sales uniform only
- D) Qualified leads generated per visit or campaign
**Answer:** D
**Explanation:** Efficiency metrics relate activity to meaningful outcomes.

**OF-091** | Fundamentals | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What is the primary aim of on-field marketing?
- A) Engage potential customers face to face and promote offerings
- B) Write software
- C) Run only online ads
- D) Manage payroll
**Answer:** A
**Explanation:** Field marketing uses in-person outreach, demonstrations, and events.

**OF-092** | Prospecting | Medium
In a practical project, which statement is the most accurate?

Context: What is prospecting?
- A) Closing every lead immediately
- B) Identifying potential customers who may fit the offering
- C) Sending invoices to everyone
- D) Ignoring the target market
**Answer:** B
**Explanation:** Prospecting builds a relevant pool of potential buyers.

**OF-093** | First Contact | Medium
A junior intern is working on a project. Which choice is the most appropriate?

Context: What is a good way to start a conversation with a prospect?
- A) Interrupt repeatedly
- B) Demand a purchase
- C) Introduce yourself briefly and ask a relevant, respectful question
- D) Immediately list every feature
**Answer:** C
**Explanation:** A respectful opener earns permission to understand needs.

**OF-094** | Needs Discovery | Medium
During a routine task, a problem appears. Which option best addresses the underlying concept?

Context: Why ask questions before pitching?
- A) Avoid learning anything about the buyer
- B) Make the meeting longer without purpose
- C) Guarantee an instant sale
- D) Understand the prospect's problem and tailor the discussion
**Answer:** D
**Explanation:** Discovery helps connect benefits to real customer needs.

**OF-095** | Pitching | Medium
A team wants to apply this idea correctly. Which action should it take?

Context: What makes a product pitch more relevant?
- A) Connect a specific benefit to a need the prospect expressed
- B) Avoid examples
- C) Use the same script regardless of customer
- D) Discuss only technical jargon
**Answer:** A
**Explanation:** Relevant benefits show how the offer addresses the customer's situation.

**OF-096** | Objections | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: A prospect says the price is too high. What should you do first?
- A) Argue that they are wrong
- B) Ask what they are comparing against and explore the concern respectfully
- C) End the conversation angrily
- D) Offer an unapproved discount immediately
**Answer:** B
**Explanation:** Clarifying the concern helps determine whether value, budget, or fit is the issue.

**OF-097** | Lead Qualification | High
A production-like scenario reveals a failure. Which response is the safest and most technically sound?

Scenario: Why qualify a lead?
- A) Guarantee every lead will buy
- B) Avoid recording any details
- C) Assess fit, need, authority, timing, and likely next steps
- D) Collect unrelated personal information
**Answer:** C
**Explanation:** Qualification focuses effort on relevant opportunities.

**OF-098** | Follow-up | High
A team sees an unexpected result despite following the basic workflow. What should it investigate first?

Scenario: What should a good follow-up message include?
- A) A demand for immediate payment
- B) An unrelated offer
- C) Repeated messages every hour
- D) A brief recap, agreed next step, and relevant timing
**Answer:** D
**Explanation:** A useful follow-up makes the next action clear and respectful.

**OF-099** | Ethics | High
Given this scenario, which decision best balances correctness and practical constraints?

Scenario: What should a marketer do if they do not know an answer to a customer's question?
- A) Be honest and commit to verifying the information
- B) Make a guarantee without approval
- C) Blame the customer
- D) Invent a feature
**Answer:** A
**Explanation:** Honesty protects trust; confirm details before promising.

**OF-100** | Reporting | High
A recurring issue appears in a real workflow. Which next step is most defensible?

Scenario: Why record field visits promptly?
- A) Guarantee a sale
- B) Keep accurate lead status, customer needs, and follow-up actions
- C) Replace customer consent
- D) Increase paperwork without benefit
**Answer:** B
**Explanation:** Accurate records support continuity and performance tracking.
