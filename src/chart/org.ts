import { ConnectionLineType } from "@xyflow/react";

export const getChartInfo = async () => {
  const response = await fetch('http://localhost:5173/org-res.json');
  const data = await response.json();
  console.log('data::', data);

  return data;
}


export const OrgChartNode = async () => {
  const data = await getChartInfo();
  const chartInfo = data.departments[0]
  console.log('chartInfo::', chartInfo, chartInfo.id);

  const nodes = [];
  const edges = [];

  [data?.departments[1]]?.forEach((department, index) => {
    // Add department node
    const deptNodeId = `dept-${department.id}`;
    nodes.push({
      id: deptNodeId,
      type: 'input',
      data: { label: `department:${department.name}` },
      position: { x: 0, y: index * 100 },
    });

    department.teams?.forEach((team, teamIndex) => {
      const teamNodeId = `team-${team.id}`;
      // Add team node
      nodes.push({
        id: teamNodeId,
        // type: 'default',
        type: 'position-logger2',
        data: { label: `team:${team.name}` },
        position: { x: index * 200 + teamIndex * 200, y: 100},
      });

      // Connect team to department
      edges.push({
        id: `edge-${deptNodeId}-${teamNodeId}`,
        source: deptNodeId,
        target: teamNodeId,
        type:ConnectionLineType.SimpleBezier
      });

      team.participants?.forEach((participant, participantIndex) => {
        const participantNodeId = `participant-${participant.id}`;
        // Add participant node
        nodes.push({
          id: participantNodeId,
          // type: 'default',
          type: 'position-logger',
          data: { label: `participant:${participant.first_name} ${participant.last_name}` , role:'participant'},
          // position: { x: 200 * 2, y: index * 700 },
          position: { x: index * 200 + teamIndex * 200 + 50, y:  100 + 100 + participantIndex * 100 },
        });

        // Connect participant to team
        edges.push({
          id: `edge-${teamNodeId}-${participantNodeId}`,
          source: teamNodeId,
          target: participantNodeId,
        type:ConnectionLineType.Bezier

        });
      });

    });
  })

  return {
    nodes,
    edges
    // nodes: [
    //   { id: String(chartInfo.id), type: 'input', position: { x: 0, y: 0 }, data: { label: chartInfo.name || '' } },
    //   {
    //     id: 'b',
    //     type: 'position-logger',
    //     position: { x: 100, y: 100 }, data: { label: 'wire 2' }
    //   },
    //   {
    //     id: 'c',
    //     type: 'position-logger',
    //     position: { x: 100, y: 200 }, data: { label: 'wire 3' },
    //     children: [
    //       {
    //         id: 'c1',
    //         type: 'position-logger',
    //         position: { x: 100, y: 200 }, data: { label: 'wire 3_1' },
    //         parent: 'c'
    //       }
    //     ]
    //   },
    // ],
    // edges: [
    //   { id: 'a->b', source: String(chartInfo.id), target: 'b', animated: false },
    //   { id: 'a->c', source: String(chartInfo.id), target: 'c', animated: false },

    // ]
   
  };
}