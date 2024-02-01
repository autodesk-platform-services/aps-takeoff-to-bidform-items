# Create BidForm Items of BuildingConnected by Takeoff of Autodesk Construction Cloud

[![Node.js](https://img.shields.io/badge/Node.js-14.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.14-blue.svg)](https://www.npmjs.com/)
[![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)]()

[![Authentication](https://img.shields.io/badge/oAuth2-v2-green.svg)](https://aps.autodesk.com/en/docs/oauth/v2/developers_guide/overview/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v2-green.svg)](https://aps.autodesk.com/en/docs/data/v2/developers_guide/overview/)
[![Model-Derivative](https://img.shields.io/badge/Model%20ModelDerivative-2.0-orange)](https://aps.autodesk.com/en/docs/model-derivative/v2/developers_guide/overview/) 
[![Viewer](https://img.shields.io/badge/viewer-v7.80-red)](https://aps.autodesk.com/en/docs/viewer/v7/developers_guide/overview/) 

[![BuildingConnected](https://img.shields.io/badge/BuildingConnected-v2-green)](https://aps.autodesk.com/en/docs/buildingconnected/v2/developers_guide/overview/) 
[![ACC TakeOff](https://img.shields.io/badge/ACCTakeoff-v1-yellow)](https://aps.autodesk.com/en/docs/acc/v1/reference/http/takeoff-projects-project_id-packages-GET/) 


[![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Level](https://img.shields.io/badge/Level-Intermediate-blue.svg)](http://developer.autodesk.com/)

![Intermediate](https://img.shields.io/badge/Level-Intermediate-green.svg)


# Description

This sample demonstrates the use case: The project administrator of BuildingConnected(BC) project creates bid scope-specific-form items with the model quantities of Autodesk Construction Cloud (ACC) Takeoff. The sample allows the user to create new BC project, bidpackage with the information from ACC project and Takeoff package. It also allows the user to edit the fields of bid form items and update with BC data.

# Thumbnail
<img src="./help/main.png" width="800"> 

# Demonstration
[![https://youtu.be/W9rGN-2XnRM](http://img.youtube.com/vi/2xALW77UUis/0.jpg)](https://youtu.be/2xALW77UUis "Create BidForm Items of BuildingConnected by Takeoff of Autodesk Construction Cloud")

# Setup

## Prerequisites

1. **APS Account**: Learn how to create a APS Account, activate subscription and create an app at [this tutorial](https://tutorials.autodesk.io/). For this new app, use **http://localhost:3000/aps/auth/callback** as Callback URL. Finally take note of the **Client ID**, **Client Secret** and Callback URL.
3. **ACC Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
4. **ACC Takeoff**: must have one active ACC project with Takeoff module enabled. 
5. **Create Takeoff Items**:
    - 5.1. Upload some sheets/models to Takeoff >> Sheets & Models
    - 5.2. Create one package with the name which will be consistent to that in buildingconntected
    - 5.3. Create some takeoff types. The corresponding quantities will be generated automatically
6. **Building Connected Account and Subscription**: You must have a relevant BuildingConnected subscription for each endpoint. In this sample, BuildingConnected Pro is needed.
    - Users (no subscription required)
    - Opportunities (Bid Board Pro)
    - All others (BuildingConnected Pro)
7. (Optional)**Bid Project and BidPackage**: Create one test project and bidPackage in BuildingConnected manually
8. **Node.js**: knowledge with [**Node.js**](https://nodejs.org/en/).
9. knowledge with **html5**,**JavaScript**, **css**,**jQuery** and **bootstrap**
10.knowledge with **Data Management API with ACC Docs**, **Viewer SDK** and **ACC Takeoff API** and **BuildingConnected API** etc.
 
## Running locally

Install [NodeJS](https://nodejs.org), version 8 or newer.

Clone this project or download it (this `nodejs` branch only). It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/autodesk-platform-services/aps-takeoff-to-bidform-items

Install the required packages using `npm install`. Set the environment variables with your client ID, client secret, callback url and finally start it. Via command line, navigate to the folder where this repository was cloned and use the following:

Mac OSX/Linux (Terminal)

    npm install
    export APS_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    export APS_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    export APS_CALLBACK_URL=<<YOUR CALLBACK URL>>
    npm start

Windows (use **Node.js command line** from Start menu)

    npm install
    set APS_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    set APS_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    set APS_CALLBACK_URL=<<YOUR CALLBACK URL>>
    npm start

OR, set environment variables at [launch.json](/.vscode/launch.json) for debugging.
 
 ## Use Cases

1. Open the browser: [http://localhost:3000](http://localhost:3000). Please watch the [Video](https://youtu.be/2xALW77UUis) for the detail and usage.

2. After the user logging succeeds, the code will start to extract all projects of Autodesk Construction Cloud (ACC) this user is member of and the takeoff packages with the projects. 

3. (Optional) Select one ACC project, in the context menu, click __Create Bid Project__, one BuildingConnected project will be created and link with this ACC project.

3. Select one BuildingConnected project. Select one Takeoff package, in the context menu, click __Create Bid Package__. This will create a bid package with the information of the ACC Takeoff package (such as name). The scope-specific-bid-form will be also initialized. 

4. When selecting the Takeoff package, the corresponding takeoff items will be exported to the table. Click any of record, the corresponding takeoff model items will be loaded in the viewer. 

5. Inspect those model items,  quantity, and unit. If they are suitable for bidding, click the arrow icon in bid column. The scope specific bid form item will be created in the list of Bid Scope Specific Forms

6. Double check the items in Bid Scope Specific Forms if they need to be modified. After it is confirmed, click upload icon to send the bid form items to BuildingConnected. 
  

## Deployment

To deploy this application to Heroku, the **Callback URL** for Forge must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret and Callback URL for Forge.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/autodesk-platform-services/aps-takeoff-to-bidform-items)

## Known Tips
1. Sheets & Models for ACC TakeOff is not ACC>>Files, while BuildingConnected project associates with ACC>>Files now. So this sample has to map BuildingConnected files to ACC>>Takeoff>>Sheets & Models
2. The mapping of bid package and takeoff package is by their name. ensure to make them consistent in order to work with this sample

## Limitations
1. This sample does not implement complex scope-specific-form such as nested sections.
2. This sample does not implement all unit types.
3. This sample only implements the type of Line Items. As to Alternates, Inclusions, etc, the section is designed, but no contents. The code logic can be similar to that of Line Items.  

# Further Reading

- [Data Management](https://aps.autodesk.com/en/docs/data/v2/developers_guide/overview/)
- [Model Derivative](https://aps.autodesk.com/en/docs/model-derivative/v2/developers_guide/overview/)
- [Viewer](https://aps.autodesk.com/en/docs/viewer/v7/developers_guide/overview/)
- [TakeOff](https://aps.autodesk.com/en/docs/acc/v1/tutorials/takeoff/)
- [BuildingConnected](https://aps.autodesk.com/en/docs/buildingconnected/v2/developers_guide/overview/)


### Blogs
- [APS Blog](https://aps.autodesk.com/blog)
- [Field of View](https://fieldofviewblog.wordpress.com/), a BIM focused blog

## License
This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by
Xiaodong Liang [@coldwood](https://twitter.com/coldwood), [Developer Advocacy and Support](http://aps.autodesk.com)
