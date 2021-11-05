import { Project } from './project';
import { ProjectToGraph } from './project-to-graph';

describe('ProjectToGraph', () => {
  it('should create an instance', () => {

    const p: Project = new Project({name: 'test'});

    expect(new ProjectToGraph(p)).toBeTruthy();
  });
});
