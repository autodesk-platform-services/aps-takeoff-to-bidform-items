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
import {
    bcUserMe,
    initBCTree,
    bcGetBidScopeSpecificForm,
    bcCreateScopeBidFormWithItems,
    bcGetScopeBidFormWithItems,
    bcCreateScopeBidFormItems,
    bcUpdateScopeBidFormItems,
    addNewLineItem
} from './bidpackage.js';

import { initTakeOffPackageTree } from './takeoff.js';

$(document).ready(function () {
    $('#autodeskSigninButton').click(function () {
        $.ajax({
            url: '/aps/auth/login',
            success: function (url) {
                location.href = url;
            }
        });
    })
    //init login logout etc
    init()
});

async function init() {
    const hasToken = await getToken()
    if (hasToken) {
        // yes, it is signed in...
        $('#autodeskSignOutButton').show();
        $('#autodeskSigninButton').hide();
        $('#refreshSourceHubs').show();
        // prepare sign out
        $('#autodeskSignOutButton').click(function () {
            $('#hiddenFrame').on('load', function (event) {
                location.href = '/aps/auth/signout';
            });
            $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
        })
        // and refresh button
        $('#refreshBids').click(function () {
            var bidPackageTree = $('#bidPackageTree').jstree(true);
            if (bidPackageTree)
                bidPackageTree.refresh();

        });

        const profile = await userProfile();
        const userMe = await bcUserMe();
        $('#bcUserId').text(userMe.id);

        const img = '<img src="' + profile.picture + '" height="20px">';
        $('#userInfo').html(img + profile.name);

        initTakeOffPackageTree();
        initBCTree();

    } else {
        $('#autodeskSignOutButton').hide();
        $('#autodeskSigninButton').show();
    }
}

async function getToken() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/aps/auth/token',
            success: function (res) {
                resolve(true)
            },
            error: function (err) {
                resolve(false)
            }
        })
    })
}

async function userProfile() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/aps/user/profile',
            success: function (profile) {
                resolve(profile)
            }
        });
    })
}


$('#addLineItem').click(function (e) {

    const randomId = Math.random().toString(16).substr(2, 8); // 6de5ccda

    const newItem = `<div id="${randomId}" class="bcScopeFormItem_BreakDown" style="display: flex;">
    <div ><input type="text"  value="" hidden></div>

    <div style="flex:0 0 8vh;"><input type="text" class="form-control" placeholder=""></div>

    <div style="flex:0 0 20vh; padding-left: 5px;"><input type="text" class="form-control" placeholder=""></div>
    <div style="flex:0 0 8vh;padding-left: 5px;"><input type="text" class="form-control" placeholder=""></div>
    <div style="flex:0 0 10vh;padding-left: 5px;">
    <div class="dropdown">
    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        lump sum   
    </button>
    <ul class="dropdown-menu" id="dropdown-${randomId}" style="overflow:auto;">
        <li><a href="#">lump sum</a></li>
        <li><a href="#">linear metres</a></li>
        <li><a href="#">square metres</a></li>
    </ul>
  </div> </div>
    <div class="form-check checkbox-lg" style="flex:0 0 2vh; padding-left: 20px"><input type="checkbox" checked style="width:20px;height:20px;"></div>
    <div style="flex:0 0 2vh; padding-left: 20px"><button type="button" class="btn btn-sm btn-default" onclick="$(\'#${randomId}\').remove();" ><span class="fa fa-trash-o""></span></button></div>
    </div>`


    $('#LineItems').append(newItem)

    $(`#dropdown-${randomId}`).click((e) => {
        var selectedValue = $(e.target).text();
        $(`#dropdown-${randomId}`).prev().text(selectedValue);
        e.preventDefault();
    });

}
)


$('#uploadScopeSpecificItems').click(async (e) => {


    const unitMap = {
        'lump sum':'EACH',
        'linear metres':'LINEAR_METERS',
        'square metres':'SQUARE_METERS' 
    }

    //get current bid package id
    const selectedNodes = $('#bidPackageTree').jstree("get_selected", true);
    if (selectedNodes && selectedNodes.length && selectedNodes[0].type == 'bidpackage') {

        //get input items
        const collection = document.getElementsByClassName("bcScopeFormItem_BreakDown");
        var inputLineItems = []
        collection.forEach(element => {
            const inputs = element.querySelectorAll('input');
            const button = element.querySelectorAll('button');

            const index = inputLineItems.push({
                                 code:inputs[1].value && inputs[1].value!=''?inputs[1].value:'',
                                 description:inputs[2].value && inputs[2].value!=''?inputs[2].value:'',
                                 quantity:inputs[3].value && inputs[3].value>0 ?Number(inputs[3].value):0,
                                 isRequired:inputs[4].checked,
                                 unit:unitMap[button[0].innerHTML.trim()],
                                 type:"COST_BREAKDOWN"})
            if(inputs[0].value!='')
                inputLineItems[index-1].id = inputs[0].value

        });

        //get existing bid forms items 
        const bcPackageId = selectedNodes[0].id
        const res = await bcGetBidScopeSpecificForm(bcPackageId)
        if (res.length == undefined || res.length==0) {
            // if no form at all, create for with input items
            await bcCreateScopeBidFormWithItems(bcPackageId, inputLineItems)
        } else {
            const formId = res[0].id
            const existingLineItems = await bcGetScopeBidFormWithItems(bcPackageId, formId)
            //if items is none, add items
            if (existingLineItems.length == 0) {
                await bcUpdateScopeBidFormItems(bcPackageId, formId, lineItems) 
            } else { 
                var updateItems = inputLineItems.filter(i=>i.id && i.id !='')
                var payloadForUpdate = {}
                for(var k in updateItems){
                    payloadForUpdate[updateItems[k].id] = {
                        code:updateItems[k].code,
                        description:updateItems[k].description,
                        quantity:updateItems[k].quantity,
                        unit:unitMap[updateItems[k].unit] 
                    }
                }
                await bcUpdateScopeBidFormItems(bcPackageId,formId,payloadForUpdate)

                var newItems = inputLineItems.filter(i=>i.id==null)  
                await bcCreateScopeBidFormItems(bcPackageId,formId,newItems)  
            } 
        } 

        //refresh the view of items for new items (attach id with DOM)

        const scopeForm = await bcGetBidScopeSpecificForm(bcPackageId)
        $('#LineItems').html('')


        const unitMap1 = {
            TOTAL_COST_ONLY: 'lump sum',
            LINEAR_METERS: 'linear metres',
            SQUARE_METERS: 'square metres',
            EACH:'lump sum'
        }

        if (scopeForm && scopeForm.length && scopeForm.length > 0) {
            //COST_BREAKDOWN
            const COST_BREAKDOWN_ITEMS = scopeForm[0].lineItems.results.filter(i => i.type == 'COST_BREAKDOWN')
            for (var k = 0; k < COST_BREAKDOWN_ITEMS.length; k++) {
                const defItem = COST_BREAKDOWN_ITEMS[k]
                const id = defItem.id
                const code = defItem.code ? defItem.code : ''
                const description = defItem.description
                const quantity = defItem.quantity?defItem.quantity:0
                const unit = unitMap1[defItem.unit]
                await addNewLineItem({id:id,code: code, description: description, quantity: quantity, unit: unit })
            }
        }
        alert('create form items or update form items done!')

    } else {
        alert('please select a package from bc tree!')
    }
})