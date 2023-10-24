function createProjectElement(id, project){
    if (project.tag == null)
        project.tag = id;
    if (project.others == null)
        project.others = "";

    html_img = `<img src='${project.image}' style="max-width: 160px"></div></div>`
    html_txt = `<p>
      <a href="${project.paper_url}"><papertitle>${project.title}</papertitle></a>
      <br>
      ${project.authors}
      <br>
      <em>${project.conference}</em>
      <br>
      ${project.others}`
    document.getElementById(id + "-img").innerHTML = html_img;
    document.getElementById(id + "-txt").innerHTML = html_txt;
}