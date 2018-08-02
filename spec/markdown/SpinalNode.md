<a name="SpinalNode"></a>

## SpinalNode ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  
**Export**:   

* [SpinalNode](#SpinalNode) ⇐ <code>Model</code>
    * _instance_
        * [.addType(appName, type)](#SpinalNode+addType)
        * [.getAppsNames()](#SpinalNode+getAppsNames) ⇒
        * [.getElement()](#SpinalNode+getElement) ⇒
        * [.getApps()](#SpinalNode+getApps) ⇒
        * [.hasRelation()](#SpinalNode+hasRelation) ⇒
        * [.addDirectedRelationParent(relation, appName)](#SpinalNode+addDirectedRelationParent)
        * [.addDirectedRelationChild(relation, appName)](#SpinalNode+addDirectedRelationChild)
        * [.addNonDirectedRelation(relation, appName)](#SpinalNode+addNonDirectedRelation)
        * [.addRelation(relation, name)](#SpinalNode+addRelation)
        * [.addRelationByApp(relation, name, appName)](#SpinalNode+addRelationByApp)
        * [.addSimpleRelation(relationType, element, [isDirected])](#SpinalNode+addSimpleRelation) ⇒
        * [.addSimpleRelationByApp(appName, relationType, element, [isDirected], [asNode])](#SpinalNode+addSimpleRelationByApp) ⇒
        * [.addToExistingRelation(relationType, element, [isDirected], [asParent])](#SpinalNode+addToExistingRelation) ⇒
        * [.addToExistingRelationByApp(appName, relationType, element, [isDirected], [asParent], [asNode])](#SpinalNode+addToExistingRelationByApp) ⇒
        * [.removeFromExistingRelationByApp(app, relation, node, [isDirected])](#SpinalNode+removeFromExistingRelationByApp)
        * [._classifyRelation(_relation)](#SpinalNode+_classifyRelation)
        * [.getRelations()](#SpinalNode+getRelations) ⇒
        * [.getRelationsByType(type)](#SpinalNode+getRelationsByType) ⇒
        * [.getRelationsByAppName(appName, asParent)](#SpinalNode+getRelationsByAppName) ⇒
        * [.getRelationsByApp(app, asParent)](#SpinalNode+getRelationsByApp) ⇒
        * [.getRelationsByAppNameByType(appName, relationType)](#SpinalNode+getRelationsByAppNameByType) ⇒
        * [.getRelationsByAppByType(app, relationType)](#SpinalNode+getRelationsByAppByType) ⇒
        * [.inNodeList(_nodelist)](#SpinalNode+inNodeList) ⇒
        * [.getNeighbors(appName, relationType)](#SpinalNode+getNeighbors) ⇒
        * [.getChildrenByApp(app)](#SpinalNode+getChildrenByApp) ⇒
        * [.hasChildren(app)](#SpinalNode+hasChildren) ⇒
        * [.getChildrenByRelationType(relationType)](#SpinalNode+getChildrenByRelationType) ⇒
        * [.isParent(relation)](#SpinalNode+isParent) ⇒
        * [.getChildrenByAppByRelation(app, relationType)](#SpinalNode+getChildrenByAppByRelation) ⇒
        * [.getChildrenElementsByAppByRelation(appName, relationType)](#SpinalNode+getChildrenElementsByAppByRelation) ⇒
        * [.getChildrenElementsByRelationType(relationType)](#SpinalNode+getChildrenElementsByRelationType) ⇒
        * [.getParentsByRelationType(relationType)](#SpinalNode+getParentsByRelationType) ⇒
        * [.removeRelation(relation, app, isDirected)](#SpinalNode+removeRelation)
        * [.removeRelations(_relations)](#SpinalNode+removeRelations)
        * [.removeRelationType(relationType)](#SpinalNode+removeRelationType)
        * [.hasAppDefined(appName)](#SpinalNode+hasAppDefined) ⇒
        * [.hasRelationByAppByTypeDefined(appName, relationType)](#SpinalNode+hasRelationByAppByTypeDefined) ⇒
        * [.toJson()](#SpinalNode+toJson) ⇒
        * [.toJsonWithRelations()](#SpinalNode+toJsonWithRelations) ⇒
        * [.toIfc()](#SpinalNode+toIfc) ⇒
    * _static_
        * [.SpinalNode](#SpinalNode.SpinalNode)
            * [new SpinalNode(name, element, relatedGraph, relations, [name])](#new_SpinalNode.SpinalNode_new)

<a name="SpinalNode+addType"></a>

### spinalNode.addType(appName, type)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 
| type | <code>string</code> | 

<a name="SpinalNode+getAppsNames"></a>

### spinalNode.getAppsNames() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all applications names as string  
<a name="SpinalNode+getElement"></a>

### spinalNode.getElement() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: A promise of the related Element  
<a name="SpinalNode+getApps"></a>

### spinalNode.getApps() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all applications  
<a name="SpinalNode+hasRelation"></a>

### spinalNode.hasRelation() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  
<a name="SpinalNode+addDirectedRelationParent"></a>

### spinalNode.addDirectedRelationParent(relation, appName)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 
| appName | <code>string</code> | 

<a name="SpinalNode+addDirectedRelationChild"></a>

### spinalNode.addDirectedRelationChild(relation, appName)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 
| appName | <code>string</code> | 

<a name="SpinalNode+addNonDirectedRelation"></a>

### spinalNode.addNonDirectedRelation(relation, appName)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 
| appName | <code>string</code> | 

<a name="SpinalNode+addRelation"></a>

### spinalNode.addRelation(relation, name)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 
| name | <code>string</code> | 

<a name="SpinalNode+addRelationByApp"></a>

### spinalNode.addRelationByApp(relation, name, appName)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type | Description |
| --- | --- | --- |
| relation | <code>SpinalRelation</code> |  |
| name | <code>string</code> | relation Name if not orginally defined |
| appName | <code>string</code> |  |

<a name="SpinalNode+addSimpleRelation"></a>

### spinalNode.addSimpleRelation(relationType, element, [isDirected]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: the created relation, undefined otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> |  | and subclass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalNode+addSimpleRelationByApp"></a>

### spinalNode.addSimpleRelationByApp(appName, relationType, element, [isDirected], [asNode]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: the created relation  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>string</code> |  |  |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> \| [<code>SpinalNode</code>](#SpinalNode) |  |  |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |
| [asNode] | <code>boolean</code> | <code>false</code> | to put a SpinalNode inside a SpinalNode |

<a name="SpinalNode+addToExistingRelation"></a>

### spinalNode.addToExistingRelation(relationType, element, [isDirected], [asParent]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: an Object of 1)relation:the relation with the added element node in (nodeList2), 2)node: the created node  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> |  | any subclass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |
| [asParent] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalNode+addToExistingRelationByApp"></a>

### spinalNode.addToExistingRelationByApp(appName, relationType, element, [isDirected], [asParent], [asNode]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: an Object of 1)relation:the relation with the added element node in (nodeList2), 2)node: the created node  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>string</code> |  |  |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> \| [<code>SpinalNode</code>](#SpinalNode) |  | Model:any subclass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |
| [asParent] | <code>boolean</code> | <code>false</code> |  |
| [asNode] | <code>boolean</code> | <code>false</code> | to put a SpinalNode inside a SpinalNode |

<a name="SpinalNode+removeFromExistingRelationByApp"></a>

### spinalNode.removeFromExistingRelationByApp(app, relation, node, [isDirected])
parent remove the child for now

**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type | Default |
| --- | --- | --- |
| app | <code>string</code> \| <code>SpinalApplication</code> |  | 
| relation | <code>string</code> \| <code>SpinalRelation</code> |  | 
| node | [<code>SpinalNode</code>](#SpinalNode) |  | 
| [isDirected] | <code>boolean</code> | <code>false</code> | 

<a name="SpinalNode+_classifyRelation"></a>

### spinalNode._classifyRelation(_relation)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| _relation | <code>SpinalRelation</code> | 

<a name="SpinalNode+getRelations"></a>

### spinalNode.getRelations() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all the relations of this Node  
<a name="SpinalNode+getRelationsByType"></a>

### spinalNode.getRelationsByType(type) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all relations of a specific relation type  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

<a name="SpinalNode+getRelationsByAppName"></a>

### spinalNode.getRelationsByAppName(appName, asParent) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: an array of all relations of a specific app for this node  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 
| asParent | <code>string</code> | 

<a name="SpinalNode+getRelationsByApp"></a>

### spinalNode.getRelationsByApp(app, asParent) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all relations of a specific app  

| Param | Type |
| --- | --- |
| app | <code>SpinalApplication</code> \| <code>string</code> | 
| asParent | <code>string</code> | 

<a name="SpinalNode+getRelationsByAppNameByType"></a>

### spinalNode.getRelationsByAppNameByType(appName, relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all relations of a specific app of a specific type  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 
| relationType | <code>string</code> | 

<a name="SpinalNode+getRelationsByAppByType"></a>

### spinalNode.getRelationsByAppByType(app, relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all relations of a specific app of a specific type  

| Param | Type |
| --- | --- |
| app | <code>SpinalApplication</code> | 
| relationType | <code>string</code> | 

<a name="SpinalNode+inNodeList"></a>

### spinalNode.inNodeList(_nodelist) ⇒
verify if an element is already in given nodeList

**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| _nodelist | [<code>Array.&lt;SpinalNode&gt;</code>](#SpinalNode) | 

<a name="SpinalNode+getNeighbors"></a>

### spinalNode.getNeighbors(appName, relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: a list of neighbors nodes  

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> \| <code>SpinalApplication</code> | optional |
| relationType | <code>string</code> | optional |

<a name="SpinalNode+getChildrenByApp"></a>

### spinalNode.getChildrenByApp(app) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| app | <code>SpinalApplication</code> \| <code>string</code> | 

<a name="SpinalNode+hasChildren"></a>

### spinalNode.hasChildren(app) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| app | <code>SpinalApplication</code> \| <code>string</code> | 

<a name="SpinalNode+getChildrenByRelationType"></a>

### spinalNode.getChildrenByRelationType(relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: array of spinalNode  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalNode+isParent"></a>

### spinalNode.isParent(relation) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 

<a name="SpinalNode+getChildrenByAppByRelation"></a>

### spinalNode.getChildrenByAppByRelation(app, relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: array of spinalNode  

| Param | Type |
| --- | --- |
| app | <code>string</code> \| <code>SpinalApplication</code> | 
| relationType | <code>string</code> \| <code>SpinalRelation</code> | 

<a name="SpinalNode+getChildrenElementsByAppByRelation"></a>

### spinalNode.getChildrenElementsByAppByRelation(appName, relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: A promise of an array of Models  

| Param | Type |
| --- | --- |
| appName | <code>string</code> \| <code>SpinalApplication</code> | 
| relationType | <code>string</code> \| <code>SpinalRelation</code> | 

<a name="SpinalNode+getChildrenElementsByRelationType"></a>

### spinalNode.getChildrenElementsByRelationType(relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: A promise of an array of Models  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalNode+getParentsByRelationType"></a>

### spinalNode.getParentsByRelationType(relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: array of spinalNode  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalNode+removeRelation"></a>

### spinalNode.removeRelation(relation, app, isDirected)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type | Description |
| --- | --- | --- |
| relation | <code>SpinalRelation</code> \| <code>string</code> |  |
| app | <code>SpinalApplication</code> \| <code>string</code> | optional |
| isDirected | <code>boolean</code> | optional |

<a name="SpinalNode+removeRelations"></a>

### spinalNode.removeRelations(_relations)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| _relations | <code>Array.&lt;SpinalRelation&gt;</code> | 

<a name="SpinalNode+removeRelationType"></a>

### spinalNode.removeRelationType(relationType)
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalNode+hasAppDefined"></a>

### spinalNode.hasAppDefined(appName) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 

<a name="SpinalNode+hasRelationByAppByTypeDefined"></a>

### spinalNode.hasRelationByAppByTypeDefined(appName, relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 
| relationType | <code>string</code> | 

<a name="SpinalNode+toJson"></a>

### spinalNode.toJson() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: A json representing the node  
<a name="SpinalNode+toJsonWithRelations"></a>

### spinalNode.toJsonWithRelations() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: A json representing the node with its relations  
<a name="SpinalNode+toIfc"></a>

### spinalNode.toIfc() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: An IFC like format representing the node  
<a name="SpinalNode.SpinalNode"></a>

### SpinalNode.SpinalNode
**Kind**: static class of [<code>SpinalNode</code>](#SpinalNode)  
<a name="new_SpinalNode.SpinalNode_new"></a>

#### new SpinalNode(name, element, relatedGraph, relations, [name])
Creates an instance of SpinalNode.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | <code>&quot;SpinalNode&quot;</code> |  |
| element | <code>Model</code> |  | any subclass of Model |
| relatedGraph | <code>SpinalGraph</code> |  |  |
| relations | <code>Array.&lt;SpinalRelation&gt;</code> |  |  |
| [name] | <code>string</code> | <code>&quot;\&quot;SpinalNode\&quot;&quot;</code> |  |

