'use strict';

spinal.contextStudio.graph.getApp('smartConnector', ['hasDevice', 'hasEndpoint', 'hasEndpointGroup']).then(smartConnector => {

  network = new SpinalNetwork("network1", "smartConnector", "10.0.0.1", "mariano", "#admin");

  device1 = new SpinalDevice("device1", "device1 id attribute");
  device2 = new SpinalDevice("device2", "device2 id attribute");
  device3 = new SpinalDevice("device3", "device3 id attribute");

  endpointGroup1 = new AbstractElement("endpointGroup1", "endpointGroup");

  endpoint1 = new SpinalEndpoint("endpoint1", "endpoint1 id attribute", "endpoint1 value", "endpoint1 unit", "endpoint1 dataType");
  endpoint2 = new SpinalEndpoint("endpoint2", "endpoint2 id attribute", "endpoint2 value", "endpoint2 unit", "endpoint2 dataType");
  endpoint3 = new SpinalEndpoint("endpoint3", "endpoint3 id attribute", "endpoint3 value", "endpoint3 unit", "endpoint3 dataType");
  endpoint4 = new SpinalEndpoint("endpoint4", "endpoint4 id attribute", "endpoint4 value", "endpoint4 unit", "endpoint4 dataType");
  endpoint5 = new SpinalEndpoint("endpoint5", "endpoint5 id attribute", "endpoint5 value", "endpoint5 unit", "endpoint5 dataType");
  endpoint6 = new SpinalEndpoint("endpoint6", "endpoint6 id attribute", "endpoint6 value", "endpoint6 unit", "endpoint6 dataType");
  endpoint7 = new SpinalEndpoint("endpoint7", "endpoint7 id attribute", "endpoint7 value", "endpoint7 unit", "endpoint7 dataType");
  endpoint8 = new SpinalEndpoint("endpoint8", "endpoint8 id attribute", "endpoint8 value", "endpoint8 unit", "endpoint8 dataType");
  endpoint9 = new SpinalEndpoint("endpoint9", "endpoint9 id attribute", "endpoint9 value", "endpoint9 unit", "endpoint9 dataType");

  networkNode = spinal.contextStudio.graph.addNode(network);

  device1Node = networkNode.addToExistingRelationByApp('smartConnector', 'hasDevice', device1, true).node;
  device2Node = networkNode.addToExistingRelationByApp('smartConnector', 'hasDevice', device2, true).node;
  device3Node = networkNode.addToExistingRelationByApp('smartConnector', 'hasDevice', device3, true).node;

  device1Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint1, true);
  device1Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint2, true);
  device1Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint3, true);
  device1Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint4, true);

  device2Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint5, true);
  device2Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint6, true);
  device2Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint7, true);
  device2Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint8, true);

  endpointGroup1Node = device3Node.addToExistingRelationByApp('smartConnector', 'hasEndpointGroup', endpointGroup1, true).node;
  endpointGroup1Node.addToExistingRelationByApp('smartConnector', 'hasEndpoint', endpoint8, true);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LmpzIl0sIm5hbWVzIjpbInNwaW5hbCIsImNvbnRleHRTdHVkaW8iLCJncmFwaCIsImdldEFwcCIsInRoZW4iLCJzbWFydENvbm5lY3RvciIsIm5ldHdvcmsiLCJTcGluYWxOZXR3b3JrIiwiZGV2aWNlMSIsIlNwaW5hbERldmljZSIsImRldmljZTIiLCJkZXZpY2UzIiwiZW5kcG9pbnRHcm91cDEiLCJBYnN0cmFjdEVsZW1lbnQiLCJlbmRwb2ludDEiLCJTcGluYWxFbmRwb2ludCIsImVuZHBvaW50MiIsImVuZHBvaW50MyIsImVuZHBvaW50NCIsImVuZHBvaW50NSIsImVuZHBvaW50NiIsImVuZHBvaW50NyIsImVuZHBvaW50OCIsImVuZHBvaW50OSIsIm5ldHdvcmtOb2RlIiwiYWRkTm9kZSIsImRldmljZTFOb2RlIiwiYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAiLCJub2RlIiwiZGV2aWNlMk5vZGUiLCJkZXZpY2UzTm9kZSIsImVuZHBvaW50R3JvdXAxTm9kZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQUEsT0FBT0MsYUFBUCxDQUFxQkMsS0FBckIsQ0FBMkJDLE1BQTNCLENBQWtDLGdCQUFsQyxFQUFvRCxDQUFDLFdBQUQsRUFBYyxhQUFkLEVBQ2xELGtCQURrRCxDQUFwRCxFQUVHQyxJQUZILENBRVFDLGtCQUFrQjs7QUFFeEJDLFlBQVUsSUFBSUMsYUFBSixDQUFrQixVQUFsQixFQUE4QixnQkFBOUIsRUFBZ0QsVUFBaEQsRUFDUixTQURRLEVBQ0csUUFESCxDQUFWOztBQUdBQyxZQUFVLElBQUlDLFlBQUosQ0FBaUIsU0FBakIsRUFBNEIsc0JBQTVCLENBQVY7QUFDQUMsWUFBVSxJQUFJRCxZQUFKLENBQWlCLFNBQWpCLEVBQTRCLHNCQUE1QixDQUFWO0FBQ0FFLFlBQVUsSUFBSUYsWUFBSixDQUFpQixTQUFqQixFQUE0QixzQkFBNUIsQ0FBVjs7QUFFQUcsbUJBQWlCLElBQUlDLGVBQUosQ0FBb0IsZ0JBQXBCLEVBQXNDLGVBQXRDLENBQWpCOztBQUVBQyxjQUFZLElBQUlDLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBQyxjQUFZLElBQUlELGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBRSxjQUFZLElBQUlGLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBRyxjQUFZLElBQUlILGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBSSxjQUFZLElBQUlKLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBSyxjQUFZLElBQUlMLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBTSxjQUFZLElBQUlOLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBTyxjQUFZLElBQUlQLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjtBQUVBUSxjQUFZLElBQUlSLGNBQUosQ0FBbUIsV0FBbkIsRUFBZ0Msd0JBQWhDLEVBQ1YsaUJBRFUsRUFDUyxnQkFEVCxFQUMyQixvQkFEM0IsQ0FBWjs7QUFHQVMsZ0JBQWN4QixPQUFPQyxhQUFQLENBQXFCQyxLQUFyQixDQUEyQnVCLE9BQTNCLENBQW1DbkIsT0FBbkMsQ0FBZDs7QUFHQW9CLGdCQUFjRixZQUFZRywwQkFBWixDQUF1QyxnQkFBdkMsRUFDWixXQURZLEVBQ0NuQixPQURELEVBQ1UsSUFEVixFQUNnQm9CLElBRDlCO0FBRUFDLGdCQUFjTCxZQUFZRywwQkFBWixDQUF1QyxnQkFBdkMsRUFDWixXQURZLEVBQ0NqQixPQURELEVBQ1UsSUFEVixFQUNnQmtCLElBRDlCO0FBRUFFLGdCQUFjTixZQUFZRywwQkFBWixDQUF1QyxnQkFBdkMsRUFDWixXQURZLEVBQ0NoQixPQURELEVBQ1UsSUFEVixFQUNnQmlCLElBRDlCOztBQUdBRixjQUFZQywwQkFBWixDQUF1QyxnQkFBdkMsRUFBeUQsYUFBekQsRUFDRWIsU0FERixFQUNhLElBRGI7QUFFQVksY0FBWUMsMEJBQVosQ0FBdUMsZ0JBQXZDLEVBQXlELGFBQXpELEVBQ0VYLFNBREYsRUFDYSxJQURiO0FBRUFVLGNBQVlDLDBCQUFaLENBQXVDLGdCQUF2QyxFQUF5RCxhQUF6RCxFQUNFVixTQURGLEVBQ2EsSUFEYjtBQUVBUyxjQUFZQywwQkFBWixDQUF1QyxnQkFBdkMsRUFBeUQsYUFBekQsRUFDRVQsU0FERixFQUNhLElBRGI7O0FBS0FXLGNBQVlGLDBCQUFaLENBQXVDLGdCQUF2QyxFQUF5RCxhQUF6RCxFQUNFUixTQURGLEVBQ2EsSUFEYjtBQUVBVSxjQUFZRiwwQkFBWixDQUF1QyxnQkFBdkMsRUFBeUQsYUFBekQsRUFDRVAsU0FERixFQUNhLElBRGI7QUFFQVMsY0FBWUYsMEJBQVosQ0FBdUMsZ0JBQXZDLEVBQXlELGFBQXpELEVBQ0VOLFNBREYsRUFDYSxJQURiO0FBRUFRLGNBQVlGLDBCQUFaLENBQXVDLGdCQUF2QyxFQUF5RCxhQUF6RCxFQUNFTCxTQURGLEVBQ2EsSUFEYjs7QUFHQVMsdUJBQXFCRCxZQUFZSCwwQkFBWixDQUNuQixnQkFEbUIsRUFDRCxrQkFEQyxFQUNtQmYsY0FEbkIsRUFDbUMsSUFEbkMsRUFDeUNnQixJQUQ5RDtBQUVBRyxxQkFBbUJKLDBCQUFuQixDQUE4QyxnQkFBOUMsRUFDRSxhQURGLEVBQ2lCTCxTQURqQixFQUM0QixJQUQ1QjtBQUVELENBbEVEIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJzcGluYWwuY29udGV4dFN0dWRpby5ncmFwaC5nZXRBcHAoJ3NtYXJ0Q29ubmVjdG9yJywgWydoYXNEZXZpY2UnLCAnaGFzRW5kcG9pbnQnLFxuICAnaGFzRW5kcG9pbnRHcm91cCdcbl0pLnRoZW4oc21hcnRDb25uZWN0b3IgPT4ge1xuXG4gIG5ldHdvcmsgPSBuZXcgU3BpbmFsTmV0d29yayhcIm5ldHdvcmsxXCIsIFwic21hcnRDb25uZWN0b3JcIiwgXCIxMC4wLjAuMVwiLFxuICAgIFwibWFyaWFub1wiLCBcIiNhZG1pblwiKVxuXG4gIGRldmljZTEgPSBuZXcgU3BpbmFsRGV2aWNlKFwiZGV2aWNlMVwiLCBcImRldmljZTEgaWQgYXR0cmlidXRlXCIpXG4gIGRldmljZTIgPSBuZXcgU3BpbmFsRGV2aWNlKFwiZGV2aWNlMlwiLCBcImRldmljZTIgaWQgYXR0cmlidXRlXCIpXG4gIGRldmljZTMgPSBuZXcgU3BpbmFsRGV2aWNlKFwiZGV2aWNlM1wiLCBcImRldmljZTMgaWQgYXR0cmlidXRlXCIpXG5cbiAgZW5kcG9pbnRHcm91cDEgPSBuZXcgQWJzdHJhY3RFbGVtZW50KFwiZW5kcG9pbnRHcm91cDFcIiwgXCJlbmRwb2ludEdyb3VwXCIpXG5cbiAgZW5kcG9pbnQxID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQxXCIsIFwiZW5kcG9pbnQxIGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQxIHZhbHVlXCIsIFwiZW5kcG9pbnQxIHVuaXRcIiwgXCJlbmRwb2ludDEgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQyID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQyXCIsIFwiZW5kcG9pbnQyIGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQyIHZhbHVlXCIsIFwiZW5kcG9pbnQyIHVuaXRcIiwgXCJlbmRwb2ludDIgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQzID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQzXCIsIFwiZW5kcG9pbnQzIGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQzIHZhbHVlXCIsIFwiZW5kcG9pbnQzIHVuaXRcIiwgXCJlbmRwb2ludDMgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQ0ID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQ0XCIsIFwiZW5kcG9pbnQ0IGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQ0IHZhbHVlXCIsIFwiZW5kcG9pbnQ0IHVuaXRcIiwgXCJlbmRwb2ludDQgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQ1ID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQ1XCIsIFwiZW5kcG9pbnQ1IGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQ1IHZhbHVlXCIsIFwiZW5kcG9pbnQ1IHVuaXRcIiwgXCJlbmRwb2ludDUgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQ2ID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQ2XCIsIFwiZW5kcG9pbnQ2IGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQ2IHZhbHVlXCIsIFwiZW5kcG9pbnQ2IHVuaXRcIiwgXCJlbmRwb2ludDYgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQ3ID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQ3XCIsIFwiZW5kcG9pbnQ3IGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQ3IHZhbHVlXCIsIFwiZW5kcG9pbnQ3IHVuaXRcIiwgXCJlbmRwb2ludDcgZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQ4ID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQ4XCIsIFwiZW5kcG9pbnQ4IGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQ4IHZhbHVlXCIsIFwiZW5kcG9pbnQ4IHVuaXRcIiwgXCJlbmRwb2ludDggZGF0YVR5cGVcIilcbiAgZW5kcG9pbnQ5ID0gbmV3IFNwaW5hbEVuZHBvaW50KFwiZW5kcG9pbnQ5XCIsIFwiZW5kcG9pbnQ5IGlkIGF0dHJpYnV0ZVwiLFxuICAgIFwiZW5kcG9pbnQ5IHZhbHVlXCIsIFwiZW5kcG9pbnQ5IHVuaXRcIiwgXCJlbmRwb2ludDkgZGF0YVR5cGVcIilcblxuICBuZXR3b3JrTm9kZSA9IHNwaW5hbC5jb250ZXh0U3R1ZGlvLmdyYXBoLmFkZE5vZGUobmV0d29yaylcblxuXG4gIGRldmljZTFOb2RlID0gbmV0d29ya05vZGUuYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoJ3NtYXJ0Q29ubmVjdG9yJyxcbiAgICAnaGFzRGV2aWNlJywgZGV2aWNlMSwgdHJ1ZSkubm9kZVxuICBkZXZpY2UyTm9kZSA9IG5ldHdvcmtOb2RlLmFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKCdzbWFydENvbm5lY3RvcicsXG4gICAgJ2hhc0RldmljZScsIGRldmljZTIsIHRydWUpLm5vZGVcbiAgZGV2aWNlM05vZGUgPSBuZXR3b3JrTm9kZS5hZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCgnc21hcnRDb25uZWN0b3InLFxuICAgICdoYXNEZXZpY2UnLCBkZXZpY2UzLCB0cnVlKS5ub2RlXG5cbiAgZGV2aWNlMU5vZGUuYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoJ3NtYXJ0Q29ubmVjdG9yJywgJ2hhc0VuZHBvaW50JyxcbiAgICBlbmRwb2ludDEsIHRydWUpXG4gIGRldmljZTFOb2RlLmFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKCdzbWFydENvbm5lY3RvcicsICdoYXNFbmRwb2ludCcsXG4gICAgZW5kcG9pbnQyLCB0cnVlKVxuICBkZXZpY2UxTm9kZS5hZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCgnc21hcnRDb25uZWN0b3InLCAnaGFzRW5kcG9pbnQnLFxuICAgIGVuZHBvaW50MywgdHJ1ZSlcbiAgZGV2aWNlMU5vZGUuYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoJ3NtYXJ0Q29ubmVjdG9yJywgJ2hhc0VuZHBvaW50JyxcbiAgICBlbmRwb2ludDQsIHRydWUpXG5cblxuXG4gIGRldmljZTJOb2RlLmFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKCdzbWFydENvbm5lY3RvcicsICdoYXNFbmRwb2ludCcsXG4gICAgZW5kcG9pbnQ1LCB0cnVlKVxuICBkZXZpY2UyTm9kZS5hZGRUb0V4aXN0aW5nUmVsYXRpb25CeUFwcCgnc21hcnRDb25uZWN0b3InLCAnaGFzRW5kcG9pbnQnLFxuICAgIGVuZHBvaW50NiwgdHJ1ZSlcbiAgZGV2aWNlMk5vZGUuYWRkVG9FeGlzdGluZ1JlbGF0aW9uQnlBcHAoJ3NtYXJ0Q29ubmVjdG9yJywgJ2hhc0VuZHBvaW50JyxcbiAgICBlbmRwb2ludDcsIHRydWUpXG4gIGRldmljZTJOb2RlLmFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKCdzbWFydENvbm5lY3RvcicsICdoYXNFbmRwb2ludCcsXG4gICAgZW5kcG9pbnQ4LCB0cnVlKVxuXG4gIGVuZHBvaW50R3JvdXAxTm9kZSA9IGRldmljZTNOb2RlLmFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKFxuICAgICdzbWFydENvbm5lY3RvcicsICdoYXNFbmRwb2ludEdyb3VwJywgZW5kcG9pbnRHcm91cDEsIHRydWUpLm5vZGVcbiAgZW5kcG9pbnRHcm91cDFOb2RlLmFkZFRvRXhpc3RpbmdSZWxhdGlvbkJ5QXBwKCdzbWFydENvbm5lY3RvcicsXG4gICAgJ2hhc0VuZHBvaW50JywgZW5kcG9pbnQ4LCB0cnVlKVxufSk7Il19