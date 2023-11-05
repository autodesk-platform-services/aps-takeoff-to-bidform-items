let { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, SERVER_SESSION_SECRET, PORT } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_CALLBACK_URL || !SERVER_SESSION_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
const INTERNAL_TOKEN_SCOPES = ['data:read','data:write','account:read'];
const PUBLIC_TOKEN_SCOPES = ['viewables:read'];
PORT = PORT || 3000;

//const APS_BASE_URL = 'https://developer-stg.api.autodesk.com';
const APS_BASE_URL = 'https://developer.api.autodesk.com';
const APS_BASE_URL_STG = 'https://developer-stg.api.autodesk.com';

var credentials = {
    token_3legged:''
}

const endpoints = {
    
    bc:{
        get_projects:`${APS_BASE_URL}/construction/buildingconnected/v2/projects`,
        get_project:`${APS_BASE_URL}/construction/buildingconnected/v2/projects/{0}`,
        get_project_cost:`${APS_BASE_URL}/construction/buildingconnected/v2/projects/{0}/costs`,
        get_bid_packages:`${APS_BASE_URL}/construction/buildingconnected/v2/bid-packages`,
        get_bid_packages:`${APS_BASE_URL}/construction/buildingconnected/v2/bid-packages`,
        get_bid_package:`${APS_BASE_URL}/construction/buildingconnected/v2/bid-packages/{0}`,
        get_invites:`${APS_BASE_URL}/construction/buildingconnected/v2/invites`,
        get_invite:`${APS_BASE_URL}/construction/buildingconnected/v2/invites/{0}`,
        get_bids:`${APS_BASE_URL}/construction/buildingconnected/v2/bids`,
        get_bid:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}`,
        get_bid_attachment:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}/attachments/{1}`,
        get_bid_line_items:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}/line-items`,
        get_bid_plugs:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}/plugs`,
        get_project_bid_forms:`${APS_BASE_URL}/construction/buildingconnected/v2/project-bid-forms`,
        get_project_bid_form:`${APS_BASE_URL}/construction/buildingconnected/v2/project-bid-forms/{0}`,
        get_project_bid_form_line_items:`${APS_BASE_URL}/construction/buildingconnected/v2/project-bid-forms/{0}/line-items`,
        get_scope_specific_bid_forms:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms`,
        get_scope_specific_bid_form:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms/{0}`,
        get_scope_specific_bid_form_line_items:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms/{0}/line-items`,
        get_opportunities:`${APS_BASE_URL}/construction/buildingconnected/v2/opportunities`,
        get_opportunitie:`${APS_BASE_URL}/construction/buildingconnected/v2/opportunities/{0}`,
        get_contacts:`${APS_BASE_URL}/construction/buildingconnected/v2/contacts`,
        get_contact:`${APS_BASE_URL}/construction/buildingconnected/v2/contacts/{0}`,
        get_users:`${APS_BASE_URL}/construction/buildingconnected/v2/users`,
        get_user:`${APS_BASE_URL}/construction/buildingconnected/v2/users/{0}`,
        get_user_me:`${APS_BASE_URL}/construction/buildingconnected/v2/users/me`,

        post_scope_specific_bid_forms:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms`,
        post_scope_specific_bid_forms_items:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms/{0}/line-items:batch-create`,
        patch_scope_specific_bid_forms_items:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms/{0}/line-items:batch-patch`,

    },
    takeoff:{
        get_packages:      `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages`,
        get_package:       `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages/{1}`,
        get_takeoff_items: `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages/{1}/takeoff-items`,
        get_takeoff_types: `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages/{1}/takeoff-types`,
        get_takeoff_content_views:  `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/content-views`,
    },
    dm:{
        get_hubs:`${APS_BASE_URL}/project/v1/hubs`,
        get_projects:`${APS_BASE_URL}/project/v1/hubs/{0}/projects`, 
        get_version_urn: `${APS_BASE_URL}/data/v1/projects/b.{0}/versions/{1}`
    }, 
    mp:{
        post_index_batchStatus:`${APS_BASE_URL}/construction/index/v2/projects/{0}/indexes:batch-status`,
        get_index: `${APS_BASE_URL}/construction/index/v2/projects/{0}/indexes/{1}` ,
        get_index_query_properties: `${APS_BASE_URL}/construction/index/v2/projects/{0}/indexes/{1}/queries/{2}/properties`,
        get_query: `${APS_BASE_URL}/construction/index/v2/projects/{0}/indexes/{1}/queries/{2}` ,
    },
    httpHeaders: function (access_token) {
        return {
          Authorization: 'Bearer ' + access_token
        }
    }  
  }
  

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_CALLBACK_URL,
    SERVER_SESSION_SECRET,
    INTERNAL_TOKEN_SCOPES,
    PUBLIC_TOKEN_SCOPES,
    PORT,
    endpoints,
    credentials 
};
  