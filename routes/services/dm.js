/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Developer Acvocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
const config = require('../../config'); 
const { get } = require('./fetch_common');  

async function getHubs() {
    try {
      let endpoint = config.endpoints.dm.get_hubs 
      const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
      const response = await get(endpoint,headers)
  
      if (response.data && response.data.length > 0) {
        console.log(`getHubs..`)
        return response.data  
      }
    } catch (e) {
      console.error(`getHubs failed: ${e}`)
      return {}
    }
  }


async function getProjects(hubId) {
    try {
        let endpoint = config.endpoints.dm.get_projects.format(hubId)+`?page[limit]=200`
        const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
        const response = await get(endpoint,headers)
    
        if (response.data && response.data.length > 0) {
          console.log(`getProjects..`)
          return response.data  
        }
      } catch (e) {
        console.error(`getProjects failed: ${e}`)
        return {}
      }
}

async function getUserProfile(oauth, ) {
    try{
        const user = new UserProfileApi()
        const profile = await user.getUserProfile(oauthClient, credentials)
        return {
            name: profile.body.firstName + ' ' + profile.body.lastName,
            picture: profile.body.profileImages.sizeX40
        }

    }catch(e){

    }
}

module.exports = { 
    getHubs,
    getProjects,
    getUserProfile
};

