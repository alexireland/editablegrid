var editableGrid = null;

function InfoHeaderRenderer(message) { this.message = message; };
InfoHeaderRenderer.prototype = new CellRenderer();
InfoHeaderRenderer.prototype.render = function(cell, value) 
{
	if (value) {
		// here we don't user cell.innerHTML="..." in order not to break the sorting header that has been create dfor us (cf. option enableSort: true)
		var link = document.createElement("a");
		link.href = "javascript:alert('" + this.message + "');";
		link.innerHTML = "<img src='images/information.png'/>";
		cell.appendChild(document.createTextNode("\u00a0\u00a0"));
		cell.appendChild(link);
	}
};

function displayMessage(text, style) { 
	$("message").innerHTML = "<p class='" + (style || "ok") + "'>" + text + "</p>"; 
} 

EditableGrid.prototype.initializeGrid = function() 
{
	with (this) {

		// use a special header renderer to show an info icon for some columns
		setHeaderRenderer("age", new InfoHeaderRenderer("The age must be an integer between 16 and 99"));
		setHeaderRenderer("height", new InfoHeaderRenderer("The height is given in meters"));
		setHeaderRenderer("continent", new InfoHeaderRenderer("Note that the list of proposed countries depends on the selected continent"));
		setHeaderRenderer("email", new InfoHeaderRenderer("Note the validator used automatically when you specify your column as being of type email"));
		setHeaderRenderer("freelance", new InfoHeaderRenderer("This column tells if the person works as a freelance or as an employee"));
		
		// show unit when rendering the height
		setCellRenderer("height", new CellRenderer({ 
			render: function(cell, value) { new NumberCellRenderer().render(cell, value ? value + " m" : ""); } 
		})); 

		// the list of allowed countries depend on the selected continent
		setEnumProvider("country", new EnumProvider({ 
			
			// the function getOptionValues is called each time the cell is edited
			// here we do only client-side processing, but you could use Ajax here to talk with your server
			// if you do, then don't forget to use Ajax in synchronous mode 
			getOptionValues: function (grid, column, rowIndex) {
				var continent = grid.getValueAt(rowIndex, 4);
				if (continent == "eu") return { "be" : "Belgique", "fr" : "France", "uk" : "Great-Britain", "nl": "Nederland"};
				else if (continent == "am") return { "br" : "Brazil", "ca": "Canada", "us" : "USA" };
				else if (continent == "af") return { "ng" : "Nigeria", "za": "South Africa", "zw" : "Zimbabwe" };
				return null;
			}
		}));

		// use a flag image to render the selected country
		setCellRenderer("country", new CellRenderer({
			render: function(cell, value) { cell.innerHTML = value ? "<img src='images/" + value.toLowerCase() + ".png' alt='" + value + "'/>" : ""; }
		})); 

		// add a cell validator to check that the age is in [16, 100[
		addCellValidator("age", new CellValidator({ 
			isValid: function(value) { return value == "" || (parseInt(value) >= 16 && parseInt(value) < 100); }
		}));
	}
}

function onloadXML() 
{
	editableGrid = new EditableGrid(
	{
		enableSort: true,
		className: "testgrid",
		editmode: "absolute", // change this to "fixed" to test out editorzone, and to "static" to get the old-school mode
		editorzoneid: "edition",

   		tableLoaded: function() { 
			displayMessage("Table loaded from XML: " + this.getRowCount() + " row(s)"); 
			this.initializeGrid();
			this.renderGrid("tablecontent");				
		},

		modelChanged: function(rowIndex, columnIndex, oldValue, newValue, row) { 
			displayMessage("Value for '" + this.getColumnName(columnIndex) + "' in row " + row.id + " has changed from '" + oldValue + "' to '" + newValue + "'");
			if (this.getColumnName(columnIndex) == "continent") this.setValueAt(rowIndex, this.getColumnIndex("country"), ""); // if we changed the continent, reset the country
		}
	});

	// load wml file (we use a trick to avoid getting an old version from the browser's cache)
	editableGrid.load("demo.xml?" + Math.floor(Math.random() * 100000));
}

function onloadHTML() 
{
	editableGrid = new EditableGrid(
	{
		enableSort: true,
		modelChanged: function(rowIndex, columnIndex, oldValue, newValue, row) { 
			displayMessage("Value for '" + this.getColumnName(columnIndex) + "' in row " + row.id + " has changed from '" + oldValue + "' to '" + newValue + "'");
			if (this.getColumnName(columnIndex) == "continent") this.setValueAt(rowIndex, this.getColumnIndex("country"), ""); // if we changed the continent, reset the country
		}
	});

	// we attach our grid to an existing table: we give for each column a name and a type
	editableGrid.attachToHTMLTable($('htmlgrid'), 
		[ new Column({ name: "name", datatype: "string(24)" }),
		  new Column({ name: "firstname", datatype: "string" }),
		  new Column({ name: "age", datatype: "integer" }),
		  new Column({ name: "height", datatype: "double" }),
		  new Column({ name: "continent", datatype: "string", optionValues: {"eu": "Europa", "am": "America", "af": "Africa" }}),
		  new Column({ name: "country", datatype: "string" }),
		  new Column({ name: "email", datatype: "email(26)" }),
		  new Column({ name: "freelance", datatype: "boolean" }) ]);

	displayMessage("Table attached: " + editableGrid.getRowCount() + " row(s)"); 
	editableGrid.initializeGrid();
	editableGrid.renderGrid();				
}