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
const unitMap = {
    TOTAL_COST_ONLY: 'lump sum',
    LINEAR_METERS: 'linear metres',
    SQUARE_METERS: 'square metres',
    EACH:'lump sum'
}


export async function bcUserMe() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/aps/bc/userme',
            success: function (me) {
                resolve(me)
            }
        });
    })
}

export async function initBCTree() {

    var bidPackageTree = $('#bidPackageTree').jstree(true);
    if (bidPackageTree) { bidPackageTree.destroy(); }

    $('#bidPackageTree').jstree({
        core: {
            themes: { icons: true },
            data: {
                url: `/aps/bc/bcTree`,
                dataType: "json",
                multiple: false,
                data: function (node) {
                    $('#bidPackageTree').jstree(true).toggle_node(node);
                    if (node.id == '#') {
                        const bcUserId = $('#bcUserId').text()
                        return { type: node.id, bcUserId: bcUserId }
                    }
                    else
                        return { id: node.id, type: node.type, data: node.data };

                },
                success: function (node) {
                }
            }
        },
        types: {
            default: {
                icon: 'fal fa-border-none'
            },
            '#': {
                icon: 'fal fa-border-none'
            },
            project: {
                icon: 'fa fa-inbox'
            },
            bidpackage: {
                icon: 'fa fa-file-zip-o'
            }
        },
        plugins:
            ["types", "state", "sort"]
    }).bind("activate_node.jstree", async (evt, data) => {
        if (data != null && data.node != null) {
            switch (data.node.type) {
                case 'project':
                    break;
                case 'bidpackage':

                    const bidPackageId = data.node.id
                    const projecId = data.node.data.projectId


                    const scopeForm = await bcGetBidScopeSpecificForm(bidPackageId)
                    $('#LineItems').html('')

                    if (scopeForm && scopeForm.length && scopeForm.length > 0) {
                        //COST_BREAKDOWN
                        const COST_BREAKDOWN_ITEMS = scopeForm[0].lineItems.results.filter(i => i.type == 'COST_BREAKDOWN')
                        for (var k = 0; k < COST_BREAKDOWN_ITEMS.length; k++) {
                            const defItem = COST_BREAKDOWN_ITEMS[k]
                            const id = defItem.id
                            const code = defItem.code ? defItem.code : ''
                            const description = defItem.description
                            const quantity = defItem.quantity?defItem.quantity:0
                            const unit = unitMap[defItem.unit]
                            await addNewLineItem({id:id,code: code, description: description, quantity: quantity, unit: unit })
                        }
                    }

                    break;
            }
        }
    });
}




async function getOneBidPackage(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidPackage/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcUser(userId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/user/${userId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcInvitees(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/invitees/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}


export async function createBCProject(payload) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/createProject`,
            type: 'POST',
            dataType: 'json',
            data: payload,
            success: function (res) {
                resolve(res)
            }
        });
    })
}


export async function createBCPackage(payload) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/createPackage`,
            type: 'POST',
            dataType: 'json',
            data: payload,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

export async function bcGetBidScopeSpecificForm(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidScopeSpecForm/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

export async function bcCreateScopeBidFormWithItems(bidPackageId,lineItems) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidScopeSpecForm/${bidPackageId}`,
            type: 'POST', 
            dataType: 'json',
            data: {payload:JSON.stringify({bidPackageId:bidPackageId,lineItems:lineItems})},
            success: function (res) {
                resolve(res)
            }
        });
    })
} 


export async function bcGetScopeBidFormWithItems(bidPackageId,formId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidScopeSpecForm/${bidPackageId}/${formId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}


export async function bcCreateScopeBidFormItems(bidPackageId,formId,lineItems) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidScopeSpecForm/${bidPackageId}/${formId}`,
            type: 'POST', 
            dataType: 'json',
            data: {lineItems:JSON.stringify(lineItems)},
            success: function (res) {
                resolve(res)
            }
        });
    })
}

export async function bcUpdateScopeBidFormItems(bidPackageId,formId,lineItems) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidScopeSpecForm/${bidPackageId}/${formId}`,
            type: 'PATCH', 
            dataType: 'json',
            data: {lineItems:JSON.stringify(lineItems)},
            success: function (res) {
                resolve(res)
            }
        });
    })
}

export function addNewLineItem(json) {

    const randomId = Math.random().toString(16).substr(2, 8); // 6de5ccda

    const newItem = `<div id="${randomId}" class="bcScopeFormItem_BreakDown" style="display: flex;">
    <div><input type="text" value="${json.id}" hidden></div>

    <div style="flex:0 0 8vh;"><input type="text" class="form-control" placeholder="" value="${json.code}"></div>
    <div style="flex:0 0 20vh; padding-left: 5px;"><input type="text" class="form-control" placeholder="" value="${json.description}"> </div>
    <div style="flex:0 0 8vh;padding-left: 5px;"><input type="text" class="form-control" placeholder="" value="${json.quantity}"> </div>
    <div style="flex:0 0 10vh;padding-left: 5px;">
    <div class="dropdown">
    <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
      ${json.unit}
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