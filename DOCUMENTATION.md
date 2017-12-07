<h1>Welcome to Intellead Data documentation!</h1>
Intellead Data aims to be an easy way to store and retrieval data of leads for Intellead project.

<h3>Contents</h3>
<ul>
  <li>Introduction</li>
    <ul>
      <li>Features</li>
    </ul>
  <li>Instalation
    <ul>
      <li>Dependencies</li>
      <li>Get a copy</li>
    </ul>
  </li>
  <li>Configuration
  <ul>
    <li>Receiving data</li>
    <li>Persisting data</li>
    <li>Mail service</li>
  </li>
  <li>Use Cases
    <ul>
      <li>Receive data [/rd-webhook]</li>
      <li>Return data from all leads [/all-leads]</li>
      <li>Return data from all qualified leads [/all-qualified-leads]</li>
      <li>Return data from all unqualified leads [/all-unqualified-leads]</li>
      <li>Export data from all qualified leads [/all-qualified-leads-excel]</li>
      <li>Return data from a specific lead [/lead-info]</li>
      <li>Update lead data with enrichment [/update-enriched-lead-information]</li>
      <li>Update lead enrichment status [/update-enrich-attempts]</li>
      <li>Return leads that need to be enriched by a specific service [/lead-to-enrich]</li>
      <li>Save lead status [/save-lead-status]</li>
    </ul>
  </li>
  <li>Copyrights and Licence</li>
</ul>
<h3>Introduction</h3>
Intellead Data aims to be an easy way to store and retrieval data for Intellead environment supporting by http protocol.
<h4>Features</h4>
This application provides lead registration, lead update and lead retrieval.
<h3>Instalation</h3>
intellead-data is a very smaller component that provide a simple way to receive data, store and retrieval.
This way you do not need to install any other components for this to work.
<h4>Dependencies</h4>
Despite what has been said above, today this application receives data from RDStation through a webhook made available by Resultados Digitais. That way you need to use RDStation and configure a webhook to receive the data.
In the configuration section, we'll talk a bit more about this.
<h4>Get a copy</h4>
I like to encourage you to contribute to the repository.<br>
This should be as easy as possible for you but there are few things to consider when contributing. The following guidelines for contribution should be followed if you want to submit a pull request.
<ul>
  <li>You need a GitHub account</li>
  <li>Submit an issue ticket for your issue if there is no one yet.</li>
  <li>If you are able and want to fix this, fork the repository on GitHub</li>
  <li>Make commits of logical units and describe them properly.</li>
  <li>If possible, submit tests to your patch / new feature so it can be tested easily.</li>
  <li>Assure nothing is broken by running all the tests.</li>
  <li>Open a pull request to the original repository and choose the right original branch you want to patch.</li>
  <li>Even if you have write access to the repository, do not directly push or merge pull-requests. Let another team member review your pull request and approve.</li>
</ul>
<h3>Configuration</h3>
Once the application is installed (check Installation) define the following settings to enable the application behavior.
<h4>Config vars</h4>
The application uses other intellead services.<br>
For this it is necessary to configure the URL variables.<br>
You must config the following vars:<br>
ENRICH_LEAD_ENRICHMENT_URL - Full URL of Lead Enrichment API from Enrich Service;<br> 
<h4>Receiving data</h4>
Today the application receives the RDStation data through a webhook.
The first configuration to do is to create the webhook through the RDStation Integrations menu.
You must:
<ul>
  <li>set the name of the webhook;</li>
  <li>To url: https: www.your_host.com<b>/rd-webhook</b>;</li>
  <li>The trigger and,</li>
  <li>Conversion events.</li>
</ul>
<h4>Persisting data</h4>
You must config var <b>MONGODB_URI</b> to persist data.
<h4>Mail service</h4>
Some services send email to the application administrator, such as error warnings.
This service uses the nodemailer library.
To do this, you must configure the variables:<br>
ADMINISTRATOR_MAIL - The administrator's email address.<br>
ADMINISTRATOR_MAIL_PASSWORD - The administrator's email password.<br>
ADMINISTRATOR_MAIL_SERVICE - The e-mail service used, eg: gmail, hotmail.
<h3>Use Cases</h3>
Some use cases for intellead-data.
<h4>Receive data [/rd-webhook]</h4>
Currently we receive data from RDStation that provides a webhook to send us data of the lead.
Once we have configured the webhook in RDStation, the service will be available to receive the data.
The service to receive data is: /rd-webhook
This service is responsible to receive data, store information from lead in database and call the service of lead enrichment intellead-enrich.
<h4>Return data from all leads [/all-leads]</h4>
In some cases, you might need to retrieve all data from all leads.
As there may be a lot of information, this service proves paginated data. That way you need to inform the number of leads you want and the number of the page.
We can call the API like this:

```javascript
var page = $('#page_number').val();
var size = $('#page_size').val();
$.ajax({
    "crossDomain": true,
    "url": "https://your_domain.com/all-leads",
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    },
    "data": {
        page_number : page,
        page_size : size
    },
})
```

This service is used by intellead-webapp.
<h4>Return data from all qualified leads [/all-qualified-leads]</h4>
In some cases, you might need to retrieve all data from all qualified leads.
As there may be a lot of information, this service proves paginated data. That way you need to inform the number of leads you want and the number of the page.
We can call the API like this:

```javascript
var page = $('#page_number').val();
var size = $('#page_size').val();
$.ajax({
    "crossDomain": true,
    "url": "https://your_domain.com/all-qualified-leads",
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    },
    "data": {
        page_number : page,
        page_size : size
    },
})
```

This service is used by intellead-webapp.
<h4>Return data from all unqualified leads [/all-unqualified-leads]</h4>
In some cases, you might need to retrieve all data from all unqualified leads.
As there may be a lot of information, this service proves paginated data. That way you need to inform the number of leads you want and the number of the page.
We can call the API like this:

```javascript
var page = $('#page_number').val();
var size = $('#page_size').val();
$.ajax({
    "crossDomain": true,
    "url": "https://your_domain.com/all-unqualified-leads",
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    },
    "data": {
        page_number : page,
        page_size : size
    },
})
```

This service is used by intellead-webapp.
<h4>Export data from all qualified leads [/all-qualified-leads-excel]</h4>
This service aims to be one way to export information from all qualified leads.
We can call the API like this:

```javascript
$.ajax({
  "crossDomain": true,
  "url": "https://your_domain.com/all-qualified-leads-excel",
  "method": "GET",
  "headers": {
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache"
  },
})
```

This service returns a .xlsx document with the following informations:<br>
id, name, job title, company, phone, email.

<h4>Return data from a specific lead [/lead-info]</h4>
Sometimes it’s desirable that retrieve all data from a specific lead.
You just need to inform the id of the lead.
We can call API like this:

```javascript
var id = $('#lead_id').val();
$.ajax({
    "crossDomain": true,
    "url": "https://your_domain.com/lead-info",
    "method": "POST",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    },
    "data": {
        lead_id : id
    },
});

```

<h4>Update lead data with enrichment [/update-enriched-lead-information]</h4>
When the lead information is enriched, this service proves a way to update the data in the database.
We can call the API like this:

```javascript
var lead_enriched = JSON.parse(data);
request.post(
    'https://your_domain.com/update-enriched-lead-information',
    { 
        json: { 
            lead_id: id, 
            rich_information: lead_enriched 
        } 
    },
    function (error, response, body) {
        if (error) {
            console.log(error);
        }
    }
);
```

Used by the intellead-enrich service.
<h4>Update lead enrichment status [/update-enrich-attempts]</h4>
This service updates the lead enrichment status. It is used to mark if the enrichment was done (true) and if no, how many attempts were made from enrichment through this service to a lead.
This mark is very important both to identify whether a lead has already been enriched by a service and to inform whether the self-enrichment schedule will consider that lead in processing.
Remember that the self enrichment schedule only considers the leads that were not marked as enriched or that the tag identifies a number less than 2 attempts.
We can call the API like this:

```javascript
var lead_id = 24234; //id of lead
var serviceName = "someService"; //name of service of enrichment
var attempts = 1; //[1, 2, true]
var qtEnrichmentAttempts = {
    [serviceName] : attempts
}
request.post(
    'https://your_domain.com/update-enrich-attempts',
    { json: { lead_id: lead_id, attempts: qtEnrichmentAttempts } },
    function (error, response, body) {
        if (error) {
            console.log(error);
        }
    }
);
```

<h4>Return leads that need to be enriched by a specific service [/lead-to-enrich]</h4>
This service is used by the intellead-enrich application's self-enrichment scheduling service.
It receives as a parameter the name of the enrichment service and searches for all the leads that were not enriched or the number of enrichment attempts is less than 2.
We can call the API like this:

```javascript
var enrichment_method = "someService";
request.get(
    'https://your_domain.com/lead-to-enrich',
    { json: { enrichService: enrichment_method } },
    function (error, response, body) {
        if (response.statusCode == 200) {
            var itens = body;
            //do something
        }
        if (error || response.statusCode != 200) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
            }
        }
    }
);
```

<h4>Save lead status [/save-lead-status]</h4>
This service is used by intellead-classification application.
After running the classification algorithm it persists this information in the lead through this service.<br>
The required parameters are the lead id and status.<br>
Accepted values for status:<br>
0 for not qualified;<br>
1 for qualified.<br>
We can call the API like this:

```python
headers = {
    'content-type': 'application/json',
    'cache-control': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.90 Safari/537.36'
}
url = 'https://your_domain.com/save-lead-status';
data = {"lead_id": str(lead_id), "lead_status": int(lead_status)}
requests.post(url, data=json.dumps(data), json={'lead_id': str(lead_id)}, headers=headers)
```


<h3>Copyrights and Licence</h3>
Project copyright and license is available at <a href="https://github.com/intellead/intellead-data/blob/master/LICENSE">LICENSE</a>.
TO DO
