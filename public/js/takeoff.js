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
import { launchViewer, highlightTakeoffItems, getViewer } from './viewer.js';
import { createBCProject, createBCPackage, addNewLineItem } from './bidpackage.js';

var currentTakeOffTypeItems = null
const unitMap = {
    EA: 'lump sum',
    M: 'linear metres',
    M2: 'square metres'
}
export async function initTakeOffPackageTree() {
    var takeOffPackageTree = $('#takeOffPackageTree').jstree(true);
    if (takeOffPackageTree) { bcTree.destroy(); }

    $('#takeOffPackageTree').jstree({
        core: {
            themes: { icons: true },
            data: {
                url: `/aps/takeoff/tree`,
                dataType: "json",
                multiple: false,
                data: function (node) {
                    $('#takeOffPackageTree').jstree(true).toggle_node(node);
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
            hub: {
                icon: 'fa fa-inbox'
            },
            project: {
                icon: 'fa fa-inbox'
            },
            package: {
                icon: 'fa fa-file-zip-o'
            }
        },

        "contextmenu": {
            items: function ($node) {
                if ($node.type == 'project') {
                    return {
                        "asc": {
                            "label": `<span>Create Bid Project</span>`,
                            "icon": "fa fa-plus",
                            "action": async (obj) => {
                                const accHubId = $node.data.hubId
                                const accProjectId = $node.id
                                const accProjectName = $node.text

                                const newBCProjectId = await createBCProject({
                                    name: accProjectName
                                    //currentAccLinkedHubId: accHubId,
                                    //currentAccLinkedProjectId: accProjectId
                                })

                                for (var i in $node.children) {
                                    const eachChild = $node.children[i]
                                    const node = $('#takeOffPackageTree').jstree(true).get_node(eachChild)
                                    node.data.bcProjectId = newBCProjectId
                                }
                                var bidPackageTree = $('#bidPackageTree').jstree(true);
                                if (bidPackageTree)
                                    bidPackageTree.refresh();

                            },
                            "_class": "asc"
                        }
                    }

                } else if ($node.type == 'package') {
                    return {
                        "asc": {
                            "label": "<span>Create Bid Package</span>",
                            "icon": "fa fa-plus",
                            "action": async (obj) => {
                                //createBidProject()  
                                //const bcProjectId = $node.data.bcProjectId
                                const selectedNodes = $('#bidPackageTree').jstree("get_selected", true);
                                if (selectedNodes && selectedNodes.length && selectedNodes.length > 0 && selectedNodes[0].type == 'project') {
                                    const bcProjectId = selectedNodes[0].id
                                    const rand = Math.random().toString(16).substr(2, 8); // 6de5ccda

                                    const accPackageName = `${$node.text}-${rand}`

                                    const newBCPackageId = await createBCPackage({
                                        projectId: bcProjectId,
                                        name: accPackageName
                                        //currentAccLinkedHubId: accHubId,
                                        //currentAccLinkedProjectId: accProjectId
                                    })
                                    $node.data.bcPackageId = newBCPackageId
                                    var bidPackageTree = $('#bidPackageTree').jstree(true);
                                    if (bidPackageTree)
                                        bidPackageTree.refresh();
                                } else {
                                    alert('please select a bc project firstly!')
                                }

                            },
                            "_class": "asc"
                        }
                    }
                }
            },
        },

        plugins:
            ["types", "state", "sort", "contextmenu"]
    }).bind("activate_node.jstree", async (evt, data) => {
        if (data != null && data.node != null) {
            switch (data.node.type) {
                case 'hub':
                    break;
                case 'project':
                    break;
                case 'package':
                    const packageId = data.node.id
                    const packageName = data.node.text
                    const projecId = data.node.data.projectId
                    renderTakeoffTable(projecId, packageName)
                    break;
            }
        }
    });
}

async function takeOffData(accProjectId, packageName) {

    const { packageId, takeOffTypes } = await accTakeOffTypes(accProjectId, packageName)
    currentTakeOffTypeItems = await accTakeOffItems(accProjectId, packageId)

    var columns = [
        { field: 'code', title: 'Code', align: 'center', width: 20, formatter: rawFormatter },
        { field: 'name', title: 'Name', align: 'center', width: 20, formatter: rawFormatter },
        { field: 'unit', title: 'Unit', align: 'center', width: 20, formatter: rawFormatter },
        { field: 'instance', title: 'Instance', align: 'center', width: 20, formatter: rawFormatter },
        { field: 'quantity', title: 'Quantity', align: 'center', width: 20, formatter: rawFormatter },
        { field: 'bid', title: 'Bid', align: 'center', width: 20, formatter: bidFormatter },

        { field: 'color', title: 'color', align: 'center', width: 20, formatter: rawFormatter, visible: false },
        { field: 'typeId', title: 'typeId', align: 'center', width: 200, formatter: rawFormatter, visible: false },
        { field: 'accProjectId', title: 'accProjectId', align: 'center', width: 200, formatter: rawFormatter, visible: false }

    ]
    var rows = []

    await Promise.all(takeOffTypes.map(async (i) => {
        const items = currentTakeOffTypeItems.filter(k => k.takeoffTypeId == i.id)


        const code = i.primaryQuantityDefinition.classificationCodeOne
        const instance = items && items.length > 0 ? items.length : 0
        const unit = i.primaryQuantityDefinition.unitOfMeasure
        const name = i.primaryQuantityDefinition.outputName ? i.primaryQuantityDefinition.outputName : i.name
        var quantity = 0
        if (unit == 'EA') {
            quantity = instance
        } else {
            await Promise.all(items.map(async (k) => {
                quantity += k.primaryQuantity.quantity
            }))
            quantity = parseFloat(quantity).toFixed(2)
        }

        //get assembly code, if any
        // var assemblyCode = '<N/A>'
        // if(items && items[0] && items[0].contentView){
        //     const modelVersionUrn = items[0].contentView.version
        //     const svf2Id = items[0].objectId
        //     assemblyCode = (await getAssemblyCode(accProjectId,encodeURIComponent(modelVersionUrn),svf2Id)).assemblyCode
        // }



        rows.push({ code: code, name: name, unit: unit, instance: instance, quantity: quantity, bid: 'bid', typeId: `${i.id}`, color: i.color, accProjectId: accProjectId })

    }));

    return { rows: rows, columns: columns }

}

export async function renderTakeoffTable(accProjectId, packageName) {

    $('.progressTakeOffItems').show();
    const { rows, columns } = await takeOffData(accProjectId, packageName)
    $(`#takeOffItemsTables`).bootstrapTable('destroy');
    $(`#takeOffItemsTables`).bootstrapTable({
        parent: this,
        data: rows,
        editable: true,
        clickToSelect: true,
        cache: false,
        showToggle: false,
        showPaginationSwitch: false,
        pagination: true,
        pageList: [5, 10, 25, 50, 100],
        pageSize: 50,
        pageNumber: 1,
        uniqueId: 'id',
        striped: true,
        search: false,
        showRefresh: false,
        minimumCountColumns: 2,
        smartDisplay: true,
        columns: columns
    });
    $('.progressTakeOffItems').hide();

    for (var i = 0; i < rows.length; i++) {
        $(`#takeoff-type-${i}`).click(async e => {

            const index = Number(e.currentTarget.getAttribute('data-index'))
            const code = rows[index].code

            const description = rows[index].name
            const quantity = rows[index].quantity
            const unit = unitMap[rows[index].unit]

            await addNewLineItem({ id:'',code: code, description: description, quantity: quantity, unit: unit })

        })
    }

    $('#takeOffItemsTables').on('click-row.bs.table', async (e, row, $element, field) => {

        const typeId = row.typeId
        const name = row.name
        const unitOfMeasure = row.unit
        const takeoffColor = row.color
        const accProjectId = row.accProjectId
        //highlight selected row
        $('#takeOffItemsTables .selectedRow').removeClass('selectedRow');
        $element.toggleClass('selectedRow') 
        //higlight the items in viewer
        loadModelAndHighlightItems(accProjectId, typeId, takeoffColor)
    })
}

async function renderTakeOffInventoryTable(items, name, unitOfMeasure) {
    var columns = []
    columns.push({ field: `name`, title: "Output Name", align: 'center', width: 50, formatter: rawFormatter })
    columns.push({ field: `unit`, title: "Unit", align: 'center', width: 50, formatter: rawFormatter })
    columns.push({ field: `quantity`, title: "Quantity", align: 'center', width: 50, formatter: rawFormatter })
    columns.push({ field: `objId`, title: "ObjectId", align: 'center', width: 50, formatter: rawFormatter, visible: false })

    var rows = []
    await Promise.all(items.map(async (i) => {
        const thisName = i.primaryQuantity.outputName ? i.primaryQuantity.outputName : name
        const quantity = i.primaryQuantity.quantity
        rows.push({ name: thisName, unit: unitOfMeasure, quantity: quantity, objId: i.objectId })
    }));

    $(`#TakeoffInventoryTable`).bootstrapTable('destroy');
    $(`#TakeoffInventoryTable`).bootstrapTable({
        parent: this,
        data: rows,
        editable: true,
        clickToSelect: true,
        cache: false,
        showToggle: false,
        showPaginationSwitch: false,
        pagination: true,
        pageList: [5, 10, 25, 50, 100],
        pageSize: 50,
        pageNumber: 1,
        uniqueId: 'id',
        striped: true,
        search: false,
        showRefresh: false,
        minimumCountColumns: 2,
        smartDisplay: true,
        columns: columns
    });

    $("#TakeoffInventoryTable").on("click-cell.bs.table", (async (field, value, row, $element) => {
        if (value.includes('Thumbnail')) {
            //show up big Thumbnail 
            $("#bigImgDiaglogImg").attr("src", `${$element.bigThumbnail.signedUrl}`);
            $('#bigImgDiaglog').modal('show');
        }
    }))


    // $('#TakeoffInventoryTable').on('click-row.bs.table', async (e, row, $element, field) => {
    //     const ids = [row.objId]
    //     const color = $('#takeoffTable .selectedRow')

    //     //takeoff type has been selected, the model has been loaded, so call
    //     //highlightTakeoffItems directly
    //     highlightTakeoffItems(ids, color)
    // })
}

export async function loadModelAndHighlightItems(accProjectId, currentTypeId, takeoffColor) {

    const items = currentTakeOffTypeItems.filter(i => i.takeoffTypeId == currentTypeId)
    const takeoffObjectIds = await Promise.all(items.map(async (i) => {
        return i.objectId;
    }));
    const modelUrn = await accModelUrn(accProjectId, encodeURIComponent(items[0].contentView.version))
    const viewer = getViewer()
    if (viewer && viewer.model && viewer.model.myData.urn == modelUrn) {
        highlightTakeoffItems(takeoffObjectIds, takeoffColor)
    } else {
        launchViewer(modelUrn, null, takeoffObjectIds, takeoffColor)
    }
}

async function accTakeOffTypes(projectId, packageName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/takeOffTypes/${projectId}/${packageName}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function accTakeOffItems(projectId, packageName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/takeOffItems/${projectId}/${packageName}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function accModelUrn(projectId, modelVersion) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/modelUrn/${projectId}/${modelVersion}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

function getBidRowByTakeOffName(row_name, justIndex) {
    /// console.info('BootstrapTable.selectRowByItemId started', { row_itemid: row_itemid, data: this.options.data });
    var that = $('#BidLevelingTable');
    that = that.data()['bootstrap.table'].data
    return new Promise((resolve, reject) => {
        $.each(that, (d_i, d_val) => {

            if (d_val.tender.split(' ').join('') == row_name.split(' ').join('')) {
                resolve(d_i)
            }
        });
    })
};

async function getTakeOffViewAndItems(projectId, packageId, typeId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/items/${projectId}/${packageId}/${typeId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function getAssemblyCode(projectId, modelVersion, svf2Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/assemblyCode/${projectId}/${modelVersion}/${svf2Id}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

function rawFormatter(value, row, index) {
    var re = value
    return re
}

function bidFormatter(value, row, index) {

    return `<button type="button" class="btn btn-sm btn-default" id="takeoff-type-${index}" value="send to bid" data-index=${index} ><span class="fa fa-paper-plane"></span></button>`
}




