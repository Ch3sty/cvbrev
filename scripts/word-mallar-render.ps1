# Word-mallarnas granskning i riktiga Word (docs/plan-cv-word-2026-11-15.md avsnitt 7).
#
# Öppnar varje .docx i en mapp med Word via COM, exporterar PDF bredvid och
# skriver en JSON-rapport med det som avgör om filen bryts snyggt:
#   - sidor, tabeller, listpunkter, stilar i bruk, dokumentets språk
#   - rubriker (Rubrik 1/2) och posttitlar/arbetsgivare som står sist på en
#     sida medan nästa stycke börjat på nästa (ensam rubrik, delad post)
#   - tomma stycken utanför tabeller
#   - antal rader på sista sidan (en sida med en enda rad är fel)
#
# Kör: powershell -ExecutionPolicy Bypass -File scripts/word-mallar-render.ps1 -Mapp <mapp>
param([Parameter(Mandatory = $true)][string]$Mapp)

$ErrorActionPreference = 'Stop'
$wdActiveEndPageNumber = 3
$wdFirstCharacterLineNumber = 10
$wdExportFormatPDF = 17

$w = New-Object -ComObject Word.Application
$w.Visible = $false
$w.DisplayAlerts = 0
$rapport = @()
try {
  foreach ($fil in Get-ChildItem -Path $Mapp -Filter *.docx | Sort-Object Name) {
    $d = $w.Documents.Open($fil.FullName, $false, $true)
    try {
      $d.Repaginate()
      $paras = @($d.Paragraphs)
      $info = @()
      foreach ($p in $paras) {
        $r = $p.Range
        $info += [pscustomobject]@{
          stil  = [string]$p.Style.NameLocal
          text  = ($r.Text -replace "[`r`a`n]", '').Trim()
          sida  = [int]$r.Information($wdActiveEndPageNumber)
          start = [int]$d.Range($r.Start, $r.Start).Information($wdActiveEndPageNumber)
          tabell = [bool]$r.Information(12)
          sprak = [int]$r.LanguageID
        }
      }
      $ensamma = @()
      $delade = @()
      for ($i = 0; $i -lt $info.Count - 1; $i++) {
        $a = $info[$i]; $b = $info[$i + 1]
        if ($b.start -gt $a.sida) {
          if ($a.stil -match 'Rubrik|Heading') { $ensamma += "$($a.stil): $($a.text)" }
          # En post som slutar med arbetsgivaren (inga punkter) får brytas efter den.
          if ($a.stil -match 'Posttitel|Spaltrubrik' -or ($a.stil -match 'Arbetsgivare' -and $b.stil -notmatch 'Posttitel|Rubrik|Heading')) { $delade += "$($a.stil): $($a.text)" }
        }
        if ($a.start -ne $a.sida -and $a.stil -match 'Rubrik|Heading|Posttitel|Arbetsgivare') {
          $delade += "delad inne i stycket, $($a.stil): $($a.text)"
        }
      }
      $tomma = @($info | Where-Object { $_.text -eq '' -and -not $_.tabell } | ForEach-Object { $_.stil })
      $sidor = [int]$d.ComputeStatistics(2)
      $sista = $d.Paragraphs.Last.Range
      $raderSista = [int]$d.Range($sista.End - 1, $sista.End - 1).Information($wdFirstCharacterLineNumber)
      $perSida = @{}
      foreach ($x in $info) { $perSida["$($x.start)"] = 1 + [int]$perSida["$($x.start)"] }
      $stilar = @($info | ForEach-Object { $_.stil } | Select-Object -Unique)
      $pdf = [System.IO.Path]::ChangeExtension($fil.FullName, '.pdf')
      $d.ExportAsFixedFormat($pdf, $wdExportFormatPDF)
      $rapport += [pscustomobject]@{
        fil             = $fil.Name
        sidor           = $sidor
        tabeller        = [int]$d.Tables.Count
        listpunkter     = [int]$d.ListParagraphs.Count
        stycken         = $info.Count
        ejSvenska       = @($info | Where-Object { $_.text -ne '' -and $_.sprak -ne 1053 } | ForEach-Object { $_.text })
        stilar          = $stilar
        ensammaRubriker = $ensamma
        deladePoster    = $delade
        tommaStycken    = $tomma
        raderSistaSidan = $raderSista
        styckenPerSida  = $perSida
      }
    } finally {
      $d.Close($false)
    }
  }
} finally {
  $w.Quit()
}
$rapport | ConvertTo-Json -Depth 5 | Out-File -FilePath (Join-Path $Mapp 'word-rapport.json') -Encoding utf8
"Klar: $($rapport.Count) filer"
