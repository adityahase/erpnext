# -*- coding: utf-8 -*-
# Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from bs4 import BeautifulSoup as bs

import frappe
from frappe.model.document import Document
from frappe.utils import gzip_compress
from frappe.utils.data import format_datetime
from frappe.utils.file_manager import save_file


class TallyMigration(Document):
	def autoname(self):
		if not self.name:
			self.name = "Tally Migration on "+ format_datetime(self.creation)

	def get_tally_company_list(self, xml):
		encoded_content = frappe.safe_encode(xml)
		compressed_content = gzip_compress(encoded_content)
		save_file(
			fname="{}-{}-{}.xml.gz".format(self.doctype, self.name, "companies"),
			content=compressed_content,
			dt=self.doctype,
			dn=self.name,
			is_private=True,
		)
		companies = self.parse(xml, "COMPANY")
		company_list = [company.NAME.string for company in companies]
		return company_list

	def parse(self, xml, entity):
		response = bs(xml, "xml")
		collection = response.ENVELOPE.BODY.DATA.COLLECTION
		entities = collection.find_all(entity)
		return entities
