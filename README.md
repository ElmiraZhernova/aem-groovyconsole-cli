# aem-groovyconsole-cli
Do you need to run groovy scripts from file system?

AEM Groovy Console CLI gives you an ability to work with groovy console (run scripts) in a following manner:

<pre><code>groovyconsole run -h http://localhost:4502 -l admin -p admin -f some-script.groovy</code></pre>

### groovyconsole run

Usage: <pre><code>groovyconsole run [options]</code></pre>

Runs single groovy script (if file name --file is specified in [options] ) or all groovy scripts in current directory(if option <mode> is set to 'all' and --file is not specified)

Options:

<pre><code>
-h, --hostname  <hostname>     Hostname of AEM instance (default: http://localhost:4502)
-l, --login  <login>          AEM user login (default: admin)
-p, --password  <password>       AEM user password (default: admin)
-f, --file  <file>           Groovy file to invoke script
-m, --mode  <mode>           Use  'all' to run all groovy scripts in current directory
</code></pre>

