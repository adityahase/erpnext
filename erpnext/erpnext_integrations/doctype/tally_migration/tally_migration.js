// Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Tally Migration', {
	refresh: function(frm) {
		frm.dashboard.set_headline_alert('Please download and run \
			<a target="_blank" href="https://github.com/adityahase/corsall/releases">CORS Proxy</a> \
			before continuing');

		frm.source_url = `http://${frm.doc.proxy_host}:${frm.doc.proxy_port}/http://${frm.doc.tally_host}:${frm.doc.tally_port}`;
		frm.company_query = `<ENVELOPE>
				<HEADER>
					<VERSION>1</VERSION>
					<TALLYREQUEST>Export</TALLYREQUEST>
					<TYPE>Collection</TYPE>
					<ID>Company</ID>
				</HEADER>
				<BODY>
					<DESC>
						<STATICVARIABLES>
							<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
						</STATICVARIABLES>
					</DESC>
				</BODY>
			</ENVELOPE>`;

		frm.ledger_query = `<ENVELOPE>
				<HEADER>
					<VERSION>1</VERSION>
					<TALLYREQUEST>Export</TALLYREQUEST>
					<TYPE>Collection</TYPE>
					<ID>New Group</ID>
				</HEADER>
				<BODY>
					<DESC>
						<STATICVARIABLES>
							<SVCURRENTCOMPANY>${frm.doc.company}</SVCURRENTCOMPANY>
							<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
						</STATICVARIABLES>
						<TDL>
							<TDLMESSAGE>
								<COLLECTION Name="New Group">
									<TYPE>Ledger</TYPE>
									<NATIVEMETHOD>Parent</NATIVEMETHOD>
									<NATIVEMETHOD>Is Deemed Positive</NATIVEMETHOD>
									<NATIVEMETHOD>Is Revenue</NATIVEMETHOD>
								</COLLECTION>
							</TDLMESSAGE>
						</TDL>
					</DESC>
				</BODY>
			</ENVELOPE>`;

		frm.group_query = `<ENVELOPE>
				<HEADER>
					<VERSION>1</VERSION>
					<TALLYREQUEST>Export</TALLYREQUEST>
					<TYPE>Collection</TYPE>
					<ID>New Group</ID>
				</HEADER>
				<BODY>
					<DESC>
						<STATICVARIABLES>
							<SVCURRENTCOMPANY>${frm.doc.company}</SVCURRENTCOMPANY>
							<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
						</STATICVARIABLES>
						<TDL>
							<TDLMESSAGE>
								<COLLECTION Name="New Group">
									<TYPE>Group</TYPE>
									<NATIVEMETHOD>Parent</NATIVEMETHOD>
									<NATIVEMETHOD>Is Deemed Positive</NATIVEMETHOD>
									<NATIVEMETHOD>Is Revenue</NATIVEMETHOD>
									<NATIVEMETHOD>Depth</NATIVEMETHOD>
								</COLLECTION>
							</TDLMESSAGE>
						</TDL>
					</DESC>
				</BODY>
			</ENVELOPE>`

		frm.item_query = `<ENVELOPE>
				<HEADER>
					<VERSION>1</VERSION>
					<TALLYREQUEST>Export</TALLYREQUEST>
					<TYPE>Collection</TYPE>
					<ID>New Group</ID>
				</HEADER>
				<BODY>
					<DESC>
						<STATICVARIABLES>
							<SVCURRENTCOMPANY>${frm.doc.company}</SVCURRENTCOMPANY>
							<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
						</STATICVARIABLES>
						<TDL>
							<TDLMESSAGE>
								<COLLECTION Name="New Group">
									<TYPE>Stock Item</TYPE>
									<NATIVEMETHOD>Base Units</NATIVEMETHOD>
								</COLLECTION>
							</TDLMESSAGE>
						</TDL>
					</DESC>
				</BODY>
			</ENVELOPE>`;

		if(true) {
			var wrapper = $(frm.fields_dict["master_fetch_status"].wrapper).empty();
			let fetch_table = $(`<table class="table table-bordered">
				<thead>
					<tr>
						<td>${ __("Master") }</td>
						<td>${ __("Status") }</td>
						<td>${ __("Data") }</td>
					</tr>
				</thead>
				<tbody></tbody>
			</table>`);
			const master_fetch_status = JSON.parse(frm.doc.master_fetch_status);
			Object.entries(master_fetch_status).forEach(entry => {
				console.log(entry)
				const fetch_row = $(`<tr>
					<td>${entry[0]}</td>
					<td>${entry[1].status}</td>
					<td>${entry[1].data}</td>
				</tr>`);
				fetch_table.find('tbody').append(fetch_row);
			});
			wrapper.append(fetch_table);
		}
		if(frm.doc.company) {
			frm.set_df_property("company", "read_only", 1);
			frm.set_df_property("fetch_company_list", "hidden", 1);
		}
	},
	fetch_company_list: function(frm) {
		frm.events.fetch(frm, frm.company_query, (data) => {
			frm.call("get_tally_company_list", data, (r) => {
					frm.set_df_property('company', 'options', r.message);
					frm.refresh_field('company');
					frm.set_df_property('company', 'reqd', 1);
					frm.refresh_field('company');
					frm.save();
				}
			)
		});
	},
	fetch_master_data: function(frm) {
		frm.events.update_mater_fetch_status(frm, "Groups", "In Progress", "");
		frm.events.fetch(frm, frm.group_query, (data) => {
			frm.events.upload(frm, "groups", data, (r) => {
					frm.events.update_mater_fetch_status(frm, "Groups", "Completed", r.file_url);
				}
			)
		});
		frm.events.update_mater_fetch_status(frm, "Ledgers", "In Progress", "");
		frm.events.fetch(frm, frm.ledger_query, (data) => {
			frm.events.upload(frm, "ledgers", data, (r) => {
					frm.events.update_mater_fetch_status(frm, "Ledgers", "Completed", r.file_url);
				}
			)
		});
		frm.events.update_mater_fetch_status(frm, "Items", "In Progress", "");
		frm.events.fetch(frm, frm.item_query, (data) => {
			frm.events.upload(frm, "items", data, (r) => {
					frm.events.update_mater_fetch_status(frm, "Items", "Completed", r.file_url);
				}
			)
		});
	},
	fetch: function(frm, query, callback) {
		$.ajax({
			url: frm.source_url,
			type: "POST",
			contentType: "application/xml",
			dataType: "text",
			data: query,
			success: callback
		});
	},
	upload: function(frm, name, data, callback) {
		frappe.upload._upload_file(
			{},
			{
				doctype: frm.doctype,
				docname: frm.docname,
				filename: name,
				filedata: btoa(unescape(encodeURIComponent(data))),
				from_form: true
			},
			{
				callback: callback
			}
		);
	},
	update_mater_fetch_status: function(frm, key, status, data) {
		let _status = JSON.parse(frm.doc.master_fetch_status);
		_status[key] = {status: status, data: data};
		frm.set_value("master_fetch_status", JSON.stringify(_status));
		frm.save();
	}
});
