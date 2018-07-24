<a name="SpinalGraph"></a>

## SpinalGraph ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  

* [SpinalGraph](#SpinalGraph) ⇐ <code>Model</code>
    * [new SpinalGraph()](#new_SpinalGraph_new)
    * _instance_
        * [.init()](#SpinalGraph+init)
        * [.getNodeBydbId(_dbId)](#SpinalGraph+getNodeBydbId) ⇒
        * [._classifyBIMElementNode(_node)](#SpinalGraph+_classifyBIMElementNode)
        * [.getDbIdByNode(_node)](#SpinalGraph+getDbIdByNode) ⇒
        * [.setName(_name)](#SpinalGraph+setName)
        * [.setStartingNode(_startingNode)](#SpinalGraph+setStartingNode)
        * [._addExternalIdNodeMappingEntry(_ElementId, _node)](#SpinalGraph+_addExternalIdNodeMappingEntry)
        * [.addNodeAsync(_element)](#SpinalGraph+addNodeAsync) ⇒
        * [.addNode(_element)](#SpinalGraph+addNode) ⇒
        * [.classifyNode(_node)](#SpinalGraph+classifyNode)
        * [.addSimpleRelationAsync(_relationType, _node, _element, [_isDirected])](#SpinalGraph+addSimpleRelationAsync) ⇒
        * [.addSimpleRelation(relationType, node, element, [isDirected])](#SpinalGraph+addSimpleRelation) ⇒
        * [.addSimpleRelationByApp(appName, relationType, node, element, [isDirected])](#SpinalGraph+addSimpleRelationByApp) ⇒
        * [.addRelation(relation, appName)](#SpinalGraph+addRelation)
        * [.addRelations(_relations)](#SpinalGraph+addRelations)
        * [._classifyRelation(relation, appName)](#SpinalGraph+_classifyRelation)
        * [.containsApp(appName)](#SpinalGraph+containsApp) ⇒
        * [.isReserved(relationType)](#SpinalGraph+isReserved) ⇒
        * [.hasReservationCredentials(relationType, appName)](#SpinalGraph+hasReservationCredentials) ⇒
        * [._classifyRelations(relations)](#SpinalGraph+_classifyRelations)
        * [._addNotExistingNodesFromList(_list)](#SpinalGraph+_addNotExistingNodesFromList)
        * [._addNotExistingNodesFromRelation(_relation)](#SpinalGraph+_addNotExistingNodesFromRelation)
        * [.getAppsByType(appType)](#SpinalGraph+getAppsByType) ⇒
        * [.getContext(name, relationsTypesLst, models, [Interactions], [startingNode], [relatedGraph])](#SpinalGraph+getContext) ⇒
        * [.getApp(name, relationsTypesLst, [relatedSpinalGraph])](#SpinalGraph+getApp) ⇒
        * [.getAppsNames()](#SpinalGraph+getAppsNames) ⇒
        * [.reserveUniqueRelationType(relationType, app)](#SpinalGraph+reserveUniqueRelationType) ⇒
    * _static_
        * [.SpinalGraph](#SpinalGraph.SpinalGraph)
            * [new SpinalGraph([_name], [_startingNode])](#new_SpinalGraph.SpinalGraph_new)

<a name="new_SpinalGraph_new"></a>

### new SpinalGraph()
The core of the interactions between the BIMElements Nodes and other Nodes(Docs, Tickets, etc ..)

<a name="SpinalGraph+init"></a>

### spinalGraph.init()
function
To put used functions as well as the SpinalGraph model in the global scope

**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
<a name="SpinalGraph+getNodeBydbId"></a>

### spinalGraph.getNodeBydbId(_dbId) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: Promise of the corresponding Node or the created one if not existing  

| Param | Type |
| --- | --- |
| _dbId | <code>number</code> | 

<a name="SpinalGraph+_classifyBIMElementNode"></a>

### spinalGraph._classifyBIMElementNode(_node)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _node | <code>SpinalNode</code> | 

<a name="SpinalGraph+getDbIdByNode"></a>

### spinalGraph.getDbIdByNode(_node) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: Promise of dbId [number]  

| Param | Type |
| --- | --- |
| _node | <code>SpinalNode</code> | 

<a name="SpinalGraph+setName"></a>

### spinalGraph.setName(_name)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _name | <code>string</code> | 

<a name="SpinalGraph+setStartingNode"></a>

### spinalGraph.setStartingNode(_startingNode)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _startingNode | <code>Ptr</code> | 

<a name="SpinalGraph+_addExternalIdNodeMappingEntry"></a>

### spinalGraph._addExternalIdNodeMappingEntry(_ElementId, _node)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type | Description |
| --- | --- | --- |
| _ElementId | <code>number</code> | the Element ExternalId |
| _node | <code>SpinalNode</code> |  |

<a name="SpinalGraph+addNodeAsync"></a>

### spinalGraph.addNodeAsync(_element) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: Promise of the created Node  

| Param | Type | Description |
| --- | --- | --- |
| _element | <code>Model</code> | any subclass of Model |

<a name="SpinalGraph+addNode"></a>

### spinalGraph.addNode(_element) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: the created Node  

| Param | Type | Description |
| --- | --- | --- |
| _element | <code>Model</code> | any subclass of Model |

<a name="SpinalGraph+classifyNode"></a>

### spinalGraph.classifyNode(_node)
Observes the type of the element inside the node add Classify it.
 It puts it in the Unclassified list Otherwise.
It adds the node to the mapping list with ExternalId if the Object is of type BIMElement

**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _node | <code>SpinalNode</code> | 

<a name="SpinalGraph+addSimpleRelationAsync"></a>

### spinalGraph.addSimpleRelationAsync(_relationType, _node, _element, [_isDirected]) ⇒
It creates the node corresponding to the _element,
then it creates a simple relation of class SpinalRelation of type:_type.

**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: a Promise of the created relation  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| _relationType | <code>string</code> |  |  |
| _node | <code>SpinalNode</code> |  |  |
| _element | <code>Model</code> |  | any subclass of Model |
| [_isDirected] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalGraph+addSimpleRelation"></a>

### spinalGraph.addSimpleRelation(relationType, node, element, [isDirected]) ⇒
It creates the node corresponding to the _element,
then it creates a simple relation of class SpinalRelation of type:_type.

**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: a Promise of the created relation  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| relationType | <code>string</code> |  |  |
| node | <code>SpinalNode</code> |  |  |
| element | <code>Model</code> |  | any subclass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalGraph+addSimpleRelationByApp"></a>

### spinalGraph.addSimpleRelationByApp(appName, relationType, node, element, [isDirected]) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: the created Relation, undefined otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>string</code> |  |  |
| relationType | <code>string</code> |  |  |
| node | <code>SpinalNode</code> |  |  |
| element | <code>Model</code> |  | any subclass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalGraph+addRelation"></a>

### spinalGraph.addRelation(relation, appName)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 
| appName | <code>string</code> | 

<a name="SpinalGraph+addRelations"></a>

### spinalGraph.addRelations(_relations)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _relations | <code>Array.&lt;SpinalRelation&gt;</code> | 

<a name="SpinalGraph+_classifyRelation"></a>

### spinalGraph._classifyRelation(relation, appName)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| relation | <code>Spinalrelation</code> | 
| appName | <code>string</code> | 

<a name="SpinalGraph+containsApp"></a>

### spinalGraph.containsApp(appName) ⇒
checks if this graph contains contains a specific App

**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: Boolean  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 

<a name="SpinalGraph+isReserved"></a>

### spinalGraph.isReserved(relationType) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalGraph+hasReservationCredentials"></a>

### spinalGraph.hasReservationCredentials(relationType, appName) ⇒
checks if the app has the right to use a reserved relation

**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 
| appName | <code>string</code> | 

<a name="SpinalGraph+_classifyRelations"></a>

### spinalGraph._classifyRelations(relations)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| relations | <code>SpinalRelations</code> | 

<a name="SpinalGraph+_addNotExistingNodesFromList"></a>

### spinalGraph._addNotExistingNodesFromList(_list)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _list | <code>Array.&lt;SpinalNode&gt;</code> | 

<a name="SpinalGraph+_addNotExistingNodesFromRelation"></a>

### spinalGraph._addNotExistingNodesFromRelation(_relation)
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  

| Param | Type |
| --- | --- |
| _relation | <code>Array.&lt;SpinalRelation&gt;</code> | 

<a name="SpinalGraph+getAppsByType"></a>

### spinalGraph.getAppsByType(appType) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: all Apps of a specific type  

| Param | Type |
| --- | --- |
| appType | <code>string</code> | 

<a name="SpinalGraph+getContext"></a>

### spinalGraph.getContext(name, relationsTypesLst, models, [Interactions], [startingNode], [relatedGraph]) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: A promise of the created Context  

| Param | Type | Default |
| --- | --- | --- |
| name | <code>string</code> |  | 
| relationsTypesLst | <code>Array.&lt;string&gt;</code> |  | 
| models | <code>Array.&lt;Object&gt;</code> |  | 
| [Interactions] | <code>Model</code> | <code>new Model()</code> | 
| [startingNode] | <code>SpinaNode</code> | <code>new SpinalNode(new AbstractElement(_name, &quot;root&quot;))</code> | 
| [relatedGraph] | [<code>SpinalGraph</code>](#SpinalGraph) | <code>this</code> | 

<a name="SpinalGraph+getApp"></a>

### spinalGraph.getApp(name, relationsTypesLst, [relatedSpinalGraph]) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: A promise of the created App  

| Param | Type | Default |
| --- | --- | --- |
| name | <code>string</code> |  | 
| relationsTypesLst | <code>Array.&lt;string&gt;</code> |  | 
| [relatedSpinalGraph] | [<code>SpinalGraph</code>](#SpinalGraph) | <code>this</code> | 

<a name="SpinalGraph+getAppsNames"></a>

### spinalGraph.getAppsNames() ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: an array of apps names  
<a name="SpinalGraph+reserveUniqueRelationType"></a>

### spinalGraph.reserveUniqueRelationType(relationType, app) ⇒
**Kind**: instance method of [<code>SpinalGraph</code>](#SpinalGraph)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 
| app | <code>SpinalApplication</code> | 

<a name="SpinalGraph.SpinalGraph"></a>

### SpinalGraph.SpinalGraph
**Kind**: static class of [<code>SpinalGraph</code>](#SpinalGraph)  
<a name="new_SpinalGraph.SpinalGraph_new"></a>

#### new SpinalGraph([_name], [_startingNode])
Creates an instance of SpinalGraph.


| Param | Type | Default |
| --- | --- | --- |
| [_name] | <code>string</code> | <code>&quot;t&quot;</code> | 
| [_startingNode] | <code>Ptr</code> | <code>new Ptr(0)</code> | 

