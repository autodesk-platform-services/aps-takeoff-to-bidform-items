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
//////////////////////////////////////////////////////////////////////

const express = require('express');
const dm_service = require('../services/dm');

const takeoff_service = require('../services/takeoff');
const { authRefreshMiddleware } = require('../services/oauth');
const config = require('../../config');
let router = express.Router();


router.get('/takeoff/tree', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const type = req.query.type

    try {
        switch (type) {
            case '#':
                const allHubs = await dm_service.getHubs();
                var returnJson = []
                await Promise.all(allHubs.map(async (p) => {
                    const hubId = `${p.id}`
                    const title = p.attributes.name == null ? '<No Title>' : p.attributes.name
                    returnJson.push(prepareItemForTakeoffTree(
                        hubId,
                        title,
                        'hub',
                        true,
                        {}
                    ))
                }));
                res.json(returnJson).end()
                break;

            case 'hub':
                const allProjects = await dm_service.getProjects(req.query.id);
                var returnJson = []
                await Promise.all(allProjects.map(async (p) => {
                    const projectId = `${p.id}`
                    const title = p.attributes.name == null ? '<No Title>' : p.attributes.name
                    returnJson.push(prepareItemForTakeoffTree(
                        projectId,
                        title,
                        'project',
                        true,
                        { hubId: req.query.id }
                    ))
                }));

                returnJson.push(prepareItemForTakeoffTree(
                    '3ac7762e-715f-4c66-837f-19b3bda122fb',
                    'Centric Hospital',
                    'project',
                    true,
                    {}
                ))
                returnJson = returnJson.slice(15,returnJson.length)

                res.json(returnJson).end()
                break;
            case "project":

                var allPackages = []
                allPackages = await takeoff_service.getPackages(allPackages, req.query.id, 100, null)
                var returnJson = []
                await Promise.all(allPackages.map(async (p) => {
                    const packageId = `${p.id}`
                    const title = p.name == null ? '<No Title>' : p.name

                    returnJson.push(prepareItemForTakeoffTree(
                        packageId,
                        title,
                        'package',
                        true,
                        { projectId: req.query.id }
                    ))
                }));
                res.json(returnJson).end()
                break;
            case 'package':
                var allTypes = await takeoff_service.getTypes(req.query.data.projectId, req.query.id)
                var returnJson = []
                await Promise.all(allTypes.map(async (t) => {
                    const typeId = `${t.id}`
                    const title = t.name == null ? '<No Title>' : t.name

                    returnJson.push(prepareItemForTakeoffTree(
                        typeId,
                        title,
                        'type',
                        false,
                        {
                            projectId: req.query.data.projectId,
                            packageId: req.query.id,
                            typeData: { name: t.name, color: t.color, unitOfMeasure: t.unitOfMeasure }
                        }
                    ))
                }));
                res.json(returnJson).end()
                break;
        }

    }
    catch (e) {
        console.error(`/takeoff/tree:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/takeOffTypes/:projectId/:packageName', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const { projectId, packageName } = req.params;
    try {
        var allPackages = []
        allPackages = await takeoff_service.getPackages(allPackages, projectId, 100, null)
        if (allPackages) {
            const onePackage = allPackages.find(i => i.name == packageName)
            const takeOffTypes = await takeoff_service.getTypes(projectId, onePackage.id)
            res.json({ packageId: onePackage.id, takeOffTypes: takeOffTypes }).end()
        } else {
            console.error(`/takeoff/takeOffTypes/:packageName:${e.message}`)
            res.end();
        }
    }
    catch (e) {
        console.error(`/takeoff/takeOffTypes/:packageName:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/takeOffItems/:projectId/:packageId', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const { projectId, packageId } = req.params;
    try {

        var allItems = []
        allItems = await takeoff_service.getItems(allItems, projectId, packageId, 100, 0)
        res.json(allItems).end()

    }
    catch (e) {
        console.error(`/takeoff/takeOffTypes/:packageName:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/type/:projectId/:packageId', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const { projectId, packageId } = req.params;
    try {
        var c = await takeoff_service.getTypes(projectId, packageId)
        res.json(c).end()
    }
    catch (e) {
        console.error(`/takeoff/onePackage/:packageName:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/items/:projectId/:packageId/:typeId', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const { projectId, packageId, typeId } = req.params;
    try {
        var allItems = []
        allItems = await takeoff_service.getItems(allItems, projectId, packageId, 100, 0)
        allItems = allItems.filter(i => i.takeoffTypeId == typeId)
        var modelVersion = allItems[0].contentView.version
        modelVersion = encodeURIComponent(modelVersion)
        var modelUrn = await takeoff_service.getModelUrn(projectId, modelVersion)

        res.json({ items: allItems, modelUrn: modelUrn }).end()
    }
    catch (e) {
        console.error(`/takeoff/items/:projectId/:packageId/:typeId:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/modelUrn/:projectId/:modelVersion', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    var { projectId, modelVersion } = req.params;
    try {

        modelVersion = encodeURIComponent(modelVersion)
        var modelUrn = await takeoff_service.getModelUrn(projectId, modelVersion)

        res.json(modelUrn).end()
    }
    catch (e) {
        console.error(`/takeoff/modelUrn/:modelVersion:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/assemblyCode/:projectId/:modelVersion/:svf2Id', authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const { projectId, modelVersion,svf2Id } = req.params;
  
    var payload = {
        versions: [
            {
                versionUrn: decodeURI(modelVersion),
                query: {
                    $or: [
                        { $eq: ["s.svf2Id", parseInt(svf2Id)] }
                    ]
                },
                columns: {
                    assemblyCode: "s.props.p54217060",
                    svf2Id: "s.svf2Id" 
                }
            } 
        ]
    }

    try {
        var result = await mp_service.postIndexBatchStatus(projectId, JSON.stringify(payload), false)
        if (result == null) {
            console.log('post index failed: ')
            console.error(`/takeoff/modelProperties/:projectId/:modelVersion failed`)
            res.end();
        } else {
            var state = result.indexes[0].state
            var indexId = result.indexes[0].indexId
            var queryId = result.indexes[0].queryId

            while (state != 'FINISHED') {
                //keep polling
                result = await mp_service.getQuery(projectId, indexId, queryId)
                state = result.state
            }
            const {properties} = await index_data.downloadQueryData(projectId, indexId,queryId) 
            if(properties && properties.length>0 && properties[0].assemblyCode)
                res.json({assemblyCode:properties[0].assemblyCode}).end()
            else
            res.json({assemblyCode:''}).end()


        }
    }
    catch (e) {
        console.error(`/takeoff/modelProperties/:projectId/:modelVersion:${e.message}`)
        res.end();
    }
});





function prepareItemForTakeoffTree(_id, _text, _type, _children, _data) {
    return {
        id: _id,
        text: _text,
        type: _type,
        children: _children,
        data: _data
    }
}
module.exports = router;
