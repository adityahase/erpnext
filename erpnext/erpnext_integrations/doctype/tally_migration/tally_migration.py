# -*- coding: utf-8 -*-
# Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from bs4 import BeautifulSoup as bs
from datetime import datetime, timedelta
import json

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
			fname="{}-{}.xml.gz".format(self.name, "companies"),
			content=compressed_content,
			dt=self.doctype,
			dn=self.name,
			is_private=True,
		)
		companies = self.parse(xml, "COMPANY")
		company_list = [company.NAME.string for company in companies]
		return company_list

	def update_voucher_count(self, xml):
		encoded_content = frappe.safe_encode(xml)
		compressed_content = gzip_compress(encoded_content)
		save_file(
			fname="{}-{}.xml.gz".format(self.name, "voucher_count"),
			content=compressed_content,
			dt=self.doctype,
			dn=self.name,
			is_private=True,
		)
		self.voucher_count = bs(xml, "xml").ENVELOPE.BODY.DATA.RESULT.string

	def update_company_period(self, xml):
		encoded_content = frappe.safe_encode(xml)
		compressed_content = gzip_compress(encoded_content)
		save_file(
			fname="{}-{}.xml.gz".format(self.name, "company_period"),
			content=compressed_content,
			dt=self.doctype,
			dn=self.name,
			is_private=True,
		)
		company = bs(xml, "xml").ENVELOPE.BODY.DATA.COLLECTION.COMPANY
		start = datetime.strptime(company.STARTINGFROM.string, "%Y%m%d")
		end = datetime.strptime(company.ENDINGAT.string, "%Y%m%d")
		segments = self.get_date_segments(start, end)
		status = {"{} - {}".format(start, end): {"start": start, "end": end, "data": "", "status": "Waiting"} for start, end in segments}
		self.voucher_fetch_status = json.dumps(status)

	def get_date_segments(self, company_start_date, company_end_date):
		difference = company_end_date - company_start_date
		daily_voucher_count = self.voucher_count // difference.days
		days_to_batch_size = self.batch_size // daily_voucher_count
		start = company_start_date
		while start <= company_end_date:
			end = start + timedelta(days=days_to_batch_size)
			yield (start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
			start = end + timedelta(days=1)

	def parse(self, xml, entity):
		response = bs(xml, "xml")
		collection = response.ENVELOPE.BODY.DATA.COLLECTION
		entities = collection.find_all(entity)
		return entities
