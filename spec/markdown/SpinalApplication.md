<a name="SpinalApplication"></a>

## SpinalApplication ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  

* [SpinalApplication](#SpinalApplication) ⇐ <code>Model</code>
    * _instance_
        * [.reserveUniqueRelationType(relationType)](#SpinalApplication+reserveUniqueRelationType)
        * [.addRelationType(relationType)](#SpinalApplication+addRelationType)
        * [.getCharacteristicElement()](#SpinalApplication+getCharacteristicElement) ⇒
        * [.addRelation(relation)](#SpinalApplication+addRelation)
        * [.hasRelationType(relationType)](#SpinalApplication+hasRelationType) ⇒
        * [.hasRelationTypeDefined(relationType)](#SpinalApplication+hasRelationTypeDefined) ⇒
        * [.getRelationsByType(relationType)](#SpinalApplication+getRelationsByType) ⇒
        * [.getRelations()](#SpinalApplication+getRelations) ⇒
        * [.getRelationsByNode(node)](#SpinalApplication+getRelationsByNode) ⇒
        * [.getRelationsByNodeByType(node, relationType)](#SpinalApplication+getRelationsByNodeByType) ⇒
        * [.getCenralNodes()](#SpinalApplication+getCenralNodes)
        * [.getCenralNodesByRelationType(relationType)](#SpinalApplication+getCenralNodesByRelationType) ⇒
        * [.getCenralNodesElements()](#SpinalApplication+getCenralNodesElements) ⇒
        * [.getCenralNodesElementsByRelationType(relationType)](#SpinalApplication+getCenralNodesElementsByRelationType) ⇒
        * [.getAssociatedElementsByNode(node)](#SpinalApplication+getAssociatedElementsByNode) ⇒
        * [.getAssociatedElementsByNodeByRelationType(node, relationType)](#SpinalApplication+getAssociatedElementsByNodeByRelationType) ⇒
    * _static_
        * [.SpinalApplication](#SpinalApplication.SpinalApplication)
            * [new SpinalApplication(name, relationsTypesLst, relatedGraph, [name])](#new_SpinalApplication.SpinalApplication_new)

<a name="SpinalApplication+reserveUniqueRelationType"></a>

### spinalApplication.reserveUniqueRelationType(relationType)
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+addRelationType"></a>

### spinalApplication.addRelationType(relationType)
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+getCharacteristicElement"></a>

### spinalApplication.getCharacteristicElement() ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: the element to bind with  
<a name="SpinalApplication+addRelation"></a>

### spinalApplication.addRelation(relation)
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  

| Param | Type |
| --- | --- |
| relation | <code>SpinalRelation</code> | 

<a name="SpinalApplication+hasRelationType"></a>

### spinalApplication.hasRelationType(relationType) ⇒
check if the application declared a relation type

**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+hasRelationTypeDefined"></a>

### spinalApplication.hasRelationTypeDefined(relationType) ⇒
check if the application created this kind of relation Type

**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: boolean  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+getRelationsByType"></a>

### spinalApplication.getRelationsByType(relationType) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: all relations of the specified type  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+getRelations"></a>

### spinalApplication.getRelations() ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: all relations related with this application  
<a name="SpinalApplication+getRelationsByNode"></a>

### spinalApplication.getRelationsByNode(node) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: all relations related with a node for this application  

| Param | Type |
| --- | --- |
| node | <code>SpinalNode</code> | 

<a name="SpinalApplication+getRelationsByNodeByType"></a>

### spinalApplication.getRelationsByNodeByType(node, relationType) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: all relations of a specific type related with a node for this application  

| Param | Type |
| --- | --- |
| node | <code>SpinalNode</code> | 
| relationType | <code>string</code> | 

<a name="SpinalApplication+getCenralNodes"></a>

### spinalApplication.getCenralNodes()
returns the nodes of the system such as BIMElementNodes
   , AbstractNodes from Relation NodeList1

**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
<a name="SpinalApplication+getCenralNodesByRelationType"></a>

### spinalApplication.getCenralNodesByRelationType(relationType) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: all BIMElement or AbstractElement Nodes (in NodeList1)  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+getCenralNodesElements"></a>

### spinalApplication.getCenralNodesElements() ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: A promise of all BIMElement or AbstractElement (in NodeList1)  
<a name="SpinalApplication+getCenralNodesElementsByRelationType"></a>

### spinalApplication.getCenralNodesElementsByRelationType(relationType) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: A promise of all BIMElement or AbstractElement (in NodeList1) of a specific type  

| Param | Type |
| --- | --- |
| relationType | <code>string</code> | 

<a name="SpinalApplication+getAssociatedElementsByNode"></a>

### spinalApplication.getAssociatedElementsByNode(node) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: A promise of all elements of (nodeList2) associated with a specific (central)node  

| Param | Type |
| --- | --- |
| node | <code>SpinalNode</code> | 

<a name="SpinalApplication+getAssociatedElementsByNodeByRelationType"></a>

### spinalApplication.getAssociatedElementsByNodeByRelationType(node, relationType) ⇒
**Kind**: instance method of [<code>SpinalApplication</code>](#SpinalApplication)  
**Returns**: A promise of all elements of (nodeList2) associated with a specific (central)node by a specific relation type  

| Param | Type |
| --- | --- |
| node | <code>SpinalNode</code> | 
| relationType | <code>string</code> | 

<a name="SpinalApplication.SpinalApplication"></a>

### SpinalApplication.SpinalApplication
**Kind**: static class of [<code>SpinalApplication</code>](#SpinalApplication)  
<a name="new_SpinalApplication.SpinalApplication_new"></a>

#### new SpinalApplication(name, relationsTypesLst, relatedGraph, [name])
Creates an instance of SpinalApplication.


| Param | Type | Default |
| --- | --- | --- |
| name | <code>string</code> | <code>&quot;SpinalApplication&quot;</code> | 
| relationsTypesLst | <code>Array.&lt;string&gt;</code> |  | 
| relatedGraph | <code>SpinalGraph</code> |  | 
| [name] | <code>string</code> | <code>&quot;\&quot;SpinalApplication\&quot;&quot;</code> | 

