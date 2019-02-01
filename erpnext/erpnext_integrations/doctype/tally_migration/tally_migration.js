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
	},
	fetch_company_list: function(frm) {
		$.ajax({
			url: frm.source_url,
			type: "POST",
			contentType: "application/xml",
			dataType: "text",
			data: frm.company_query,
			success: (result) => {
				frm.call("get_tally_company_list",
					{xml: result},
					(r) => {
						frm.set_df_property('company', 'options', r.message);
						frm.refresh_field('company');
						frm.set_df_property('company', 'reqd', 1);
						frm.refresh_field('company');
						frm.save();
					}
				);
			}
		});
	},
});
