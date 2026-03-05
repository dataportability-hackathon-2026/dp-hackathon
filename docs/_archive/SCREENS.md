Splash Screen - hompeage, /dashboard is the main screen, blocked by auth, redirect to login if not authenticated, redirects to /dashboard if authenticated
for dev, create a button to login with a fake email and password

Main
A filterable grid of you your projects, Notebook LLM

Other screens:

View/Edit/Create your
Core Model, 1 per persona

- Node Graph with Sidebar when Selecting Nodes or Edges, grouped by cagegoriy model attributes
- type-form, snap-scroll, form wizard with 12 screens, swipe vertical, each with placeholder headline, form field, and next/save button, and back button, with fixed heeader pagiatnois.
- endpoint that gernates the code model based on the node graph and the form data, it happens on mutation
- a full panel of json of the core model

Tag CRUD screen, with a grid of tags, and a form to create a new tag, and a way to see which files and projects are tagged with a tag.

Files CRUD screen, with a filterable searcinga, bulk editable, datatable of files, and forms to create new files, and CRUD for collections of files, and edit the colelction and individual file metadata, to include tags, and projects, and the ability preview the file.

Learning Agent screen, with a sidebar of learning agents, and a main panel the canvas and chat interface of the learning agent, and a form to create and configure a new learning agent, CRUD  operations for the learning agent, settings for the learning agent for which channels, commands, and abilities it has, and CRUD for files and collections of files, and edit the learning agent metadata, to include tags, and projects, and the ability preview the learning agent. The agent includes subject matter, consumes the Core Model as JSON, and outputs structured JSON that is used to creat learning materials. and checks if there's a current progress markdown, and if not, it creates one. its internal evals and data is stored in the database.

The canvas can be anything, and the app allows for a registefdf bumber of copmnetns, like - Custom UI with [JSON_RENDER](https://json-render.dev/docs/quick-start)
    - Totally open UI, if self-rolled
    - Powerful, able to build anyting

The main canvas is a chat converations, that renders custom UI components, but also allows for artifacts. with attahcemst,s model secltion, deep research, off the reacord, and permissions. and loading psinner on load. whre the chat conerastinoa has tool calls, reasoning, loading, mcp ui, and copy, share, thubs up thimsb dopwn

artifacts are modeuls for learning subnect mqtter - flash cards, quizzes, text content, video. for now, only those are the options

The admini can uset the persons as themselfves, and try differn core models.

The app use evals, with teh "evalite" library to rune evals on the core model gnerations, the cntennt file injestion, and the learning agent gnerations.
The learning agents use "just-bash" and "bash-toole" to use AGENTS.md and othe makrdown, as a guide to create the learning agents. And when the saves, it does so as a markdown file, and can be edited later.

The modesl only use "AI_GATEWAY_API_KEY" and ai sdk to generate content. markdown file is going to eb a AGENTS.md and CLAUDE.md

The main user flow is the user first creasdf their core model, then they upload materials, or pick from existing. then create a new learnign agent, and confugre it to use thie materials. The user nagatest ehagetns like a tile grid. each agent iw q chat + canfas screen with lerning materials createed Te user can scorll thorugh the generateid recouerces in thec cnaves, just like the scrill through the form fields wien creating the core model.
