# ERPNext Tally Migrator

###  How to Setup Tally Migrator?

#### Download and Run

1. Download [Tally Migrator executable](https://erpnext.org/assets/tally-migrator.exe)

1. Run Executable

#### Download and Run

1. Download [Tally Migrator executable](https://erpnext.org/assets/tally-migrator.exe)

1. Run Executable


#### Migrate Data

1. Fill In .

1. The indicator will change from "Connected to QuickBooks" to "In Progress".

1. Progress bars will show the status of migration.

1. This will take a few minutes depending on the size of data.

1. After migration is complete, indicator will change to "Complete" or "Failed".



## What Will Happen when I Click Fetch Data?


### Account

1.  #### Existing Chart of Accounts

    Upon creation of a Company ERPNext creates a chart of accounts for that company, these accounts will be kept.

1. #### Account Naming

    To avoid name collision with existing accounts, all accounts from Tally will be assigned "- TL" suffix.

    e.g. `Job Expense` will become  `Job Expense - TL`.

    **Note**: ERPNext also encodes account names with Company abbreviation. Taking this into account `Job Expense` will become  `Job Expense - TL - AZ` (assuming `AZ` is the company abbreviation).

1. #### Root Accounts

    Four root accounts, namely `Asset`, `Expense`, `Liability`, `Income` will be created and all accounts (depending on the account type) will become children of these accounts.


### Item

1. #### Naming

    All Items will have company encoded names.

1. #### Inventory

    Irrespective of whether Item is an Inventory or Non-Inventory Item in QuickBooks, No Inventory related information will be kept.

### Parties

    Customer and Supplier

1. #### Naming

    All Customer and Suppliers will have company encoded names.


### Invoice

1. #### Variants

    QuickBooks has four transactional variants of Invoice, all of these will be saved as Sales Invoice.

    - **Invoice** is equivalent to a Sales Invoice.
    - **Sales Receipt** is equivalent to a POS Sales Invoice.
    - **Credit Memo** is equivalent to a return Sales Invoice (Credit Note).
    - **Refund Receipt** is equivalent to a return POS Sales Invoice.

1. #### Special Case

    If a QuickBooks Invoice is linked to a `Delayed Charge` or `Statement Charge` then an equivalent `Journal Entry` is created for this Invoice.




### Bill

1. #### Variants

    QuickBooks has two transactional variants of Bill, all of these will be saved as Purchase Invoice.

    - **Bill** is equivalent to a Purchase Invoice.
    - **Supplier Credit** is equivalent to a return Purchase Invoice.


### Journal Entry

Journal Entry will be saved as a Journal Entry.



### Custom Fields

Tally Migrator will add following Custom Fields

- Company field
    - Customer
    - Item
    - Supplier

- Tally ID field
    - Customer
    - Item
    - Journal Entry
    - Purchase Invoice
    - Sales Invoice
    - Supplier
