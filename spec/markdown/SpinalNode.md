<a name="SpinalNode"></a>

## SpinalNode ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  
**Export**:   

* [SpinalNode](#SpinalNode) ⇐ <code>Model</code>
    * _instance_
        * [.getAppsNames()](#SpinalNode+getAppsNames) ⇒
        * [.getApps()](#SpinalNode+getApps) ⇒
        * [.hasRelation()](#SpinalNode+hasRelation) ⇒
        * [.addDirectedRelationParent(relation, appName)](#SpinalNode+addDirectedRelationParent)
        * [.addDirectedRelationChild(relation, appName)](#SpinalNode+addDirectedRelationChild)
        * [.addNonDirectedRelation(relation, appName)](#SpinalNode+addNonDirectedRelation)
        * [.addRelation(relation, name)](#SpinalNode+addRelation)
        * [.addRelationByApp(relation, name, appName)](#SpinalNode+addRelationByApp)
        * [.addSimpleRelation(relationType, element, [isDirected])](#SpinalNode+addSimpleRelation) ⇒
        * [.addSimpleRelationByApp(appName, relationType, element, [isDirected])](#SpinalNode+addSimpleRelationByApp) ⇒
        * [.addToExistingRelation(relationType, element, [isDirected], [asParent])](#SpinalNode+addToExistingRelation) ⇒
        * [.addToExistingRelationByApp(appName, relationType, element, [isDirected], [asParent])](#SpinalNode+addToExistingRelationByApp) ⇒
        * [._classifyRelation(_relation)](#SpinalNode+_classifyRelation)
        * [.getRelations()](#SpinalNode+getRelations) ⇒
        * [.getRelationsByType(type)](#SpinalNode+getRelationsByType) ⇒
        * [.getRelationsByAppName(appName)](#SpinalNode+getRelationsByAppName) ⇒
        * [.getRelationsByApp(app)](#SpinalNode+getRelationsByApp) ⇒
        * [.getRelationsByAppNameByType(appName, relationType)](#SpinalNode+getRelationsByAppNameByType) ⇒
        * [.getRelationsByAppByType(app, relationType)](#SpinalNode+getRelationsByAppByType) ⇒
        * [.inNodeList(_nodelist)](#SpinalNode+inNodeList) ⇒
        * [.getNeighbors(relationType)](#SpinalNode+getNeighbors) ⇒
    * _static_
        * [.SpinalNode](#SpinalNode.SpinalNode)
            * [new SpinalNode(name, element, relatedGraph, relations, [name])](#new_SpinalNode.SpinalNode_new)

<a name="SpinalNode+getAppsNames"></a>

### spinalNode.getAppsNames() ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all applications names as string  
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
| name | <code>string</code> | relation Name if not organilly defined |
| appName | <code>string</code> |  |

<a name="SpinalNode+addSimpleRelation"></a>

### spinalNode.addSimpleRelation(relationType, element, [isDirected]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: the created relation, undefined otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> |  | and subClass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalNode+addSimpleRelationByApp"></a>

### spinalNode.addSimpleRelationByApp(appName, relationType, element, [isDirected]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: the created relation  

| Param | Type | Default |
| --- | --- | --- |
| appName | <code>string</code> |  | 
| relationType | <code>string</code> |  | 
| element | <code>Model</code> |  | 
| [isDirected] | <code>boolean</code> | <code>false</code> | 

<a name="SpinalNode+addToExistingRelation"></a>

### spinalNode.addToExistingRelation(relationType, element, [isDirected], [asParent]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: the relation with the added element node in (nodeList2)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> |  | any subClass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |
| [asParent] | <code>boolean</code> | <code>false</code> |  |

<a name="SpinalNode+addToExistingRelationByApp"></a>

### spinalNode.addToExistingRelationByApp(appName, relationType, element, [isDirected], [asParent]) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: the relation with the added element node in (nodeList2)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| appName | <code>string</code> |  |  |
| relationType | <code>string</code> |  |  |
| element | <code>Model</code> |  | any subClass of Model |
| [isDirected] | <code>boolean</code> | <code>false</code> |  |
| [asParent] | <code>boolean</code> | <code>false</code> |  |

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

### spinalNode.getRelationsByAppName(appName) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all relations of a specific app  

| Param | Type |
| --- | --- |
| appName | <code>string</code> | 

<a name="SpinalNode+getRelationsByApp"></a>

### spinalNode.getRelationsByApp(app) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: all relations of a specific app  

| Param | Type |
| --- | --- |
| app | <code>SpinalApplication</code> | 

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

### spinalNode.getNeighbors(relationType) ⇒
**Kind**: instance method of [<code>SpinalNode</code>](#SpinalNode)  
**Returns**: a list of neighbors nodes  

| Param | Type | Description |
| --- | --- | --- |
| relationType | <code>string</code> | optional |

<a name="SpinalNode.SpinalNode"></a>

### SpinalNode.SpinalNode
**Kind**: static class of [<code>SpinalNode</code>](#SpinalNode)  
<a name="new_SpinalNode.SpinalNode_new"></a>

#### new SpinalNode(name, element, relatedGraph, relations, [name])
Creates an instance of SpinalNode.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | <code>&quot;SpinalNode&quot;</code> |  |
| element | <code>Model</code> |  | any subClass of Model |
| relatedGraph | <code>SpinalGraph</code> |  |  |
| relations | <code>Array.&lt;SpinalRelation&gt;</code> |  |  |
| [name] | <code>string</code> | <code>&quot;\&quot;SpinalNode\&quot;&quot;</code> |  |

