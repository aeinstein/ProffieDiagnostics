<?php

class ArduinoCLI_Wrapper {
    private $config;
    private $cmd = "/usr/bin/arduino-cli";
    private $fqbn = "proffieboard:stm32l4:ProffieboardV3-L452RE";
    private $source_ino = "/CRYPTED/RAID/installs/ProffieOS/ProffieOS.ino";
    private $additional_urls = "https://profezzorn.github.io/arduino-proffieboard/package_proffieboard_index.json";
    private $output_dir = "/home/tellimate/testarea/arduino";
    /**
     * @var mixed
     */
    private $verbose = false;

    function __construct($config){
        $this->config = $config;
    }

    function setVerbose($enabled){
        $this->verbose = $enabled;
    }

    function compile(){
        $cmdline = $this->cmd." compile ";
        $cmdline .= "--fqbn ".$this->fqbn;
        $cmdline .= "--additional-urls ".$this->additional_urls;
        $cmdline .= "--output-dir ".$this->output_dir;
        if($this->verbose) $cmdline .= " --verbose";

        $cmdline .= $this->source_ino;

        $compiler = popen($cmdline, "r");

        while(!feof($compiler)) {
            // send the current file part to the browser
            print fread($compiler, 1024);

            // flush the content to the browser
            flush();
        }

        fclose($compiler);

    }
}